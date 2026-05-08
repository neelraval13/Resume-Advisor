/**
 * Typed API client for the Jogen backend.
 *
 * All HTTP calls go through `apiFetch()`, which:
 *   - prepends the API URL from config
 *   - adds the X-API-Key header when configured
 *   - throws typed errors on non-2xx responses
 *   - normalizes JSON parsing failures
 */
import { config } from "./config";
import { parseSSEStream } from "./sse";
import type {
  AnalyzeStreamEvent,
  ErrorDetail,
  FetchJDRequest,
  FetchJDResponse,
  ParseResponse,
} from "./types";

// ─── Error types ────────────────────────────────────────────────────────

/**
 * Base class for any API failure. Callers can catch this to handle all
 * API errors uniformly, or catch the subclasses for specific cases.
 */
export class APIError extends Error {
  readonly code: string;
  readonly status: number;
  readonly detail: string | null;

  constructor(
    code: string,
    message: string,
    status: number,
    detail: string | null = null,
  ) {
    super(message);
    this.name = "APIError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

/** 4xx — the request was rejected by the server (validation, auth, etc.). */
export class ClientError extends APIError {
  constructor(
    code: string,
    message: string,
    status: number,
    detail: string | null = null,
  ) {
    super(code, message, status, detail);
    this.name = "ClientError";
  }
}

/** 5xx — the server failed to handle a valid request. */
export class ServerError extends APIError {
  constructor(
    code: string,
    message: string,
    status: number,
    detail: string | null = null,
  ) {
    super(code, message, status, detail);
    this.name = "ServerError";
  }
}

/** Network-level failures (offline, DNS, CORS, etc.) — request never reached the server. */
export class NetworkError extends APIError {
  constructor(message: string) {
    super("network_error", message, 0, null);
    this.name = "NetworkError";
  }
}

// ─── Internal helpers ───────────────────────────────────────────────────

function buildHeaders(extra: HeadersInit = {}): Headers {
  const headers = new Headers(extra);
  if (config.apiKey) {
    headers.set("X-API-Key", config.apiKey);
  }
  return headers;
}

/**
 * Parse a non-2xx response into a typed error and throw it.
 * Backend always returns ErrorDetail-shaped JSON for our routes.
 */
async function throwHttpError(response: Response): Promise<never> {
  let errorBody: ErrorDetail | null = null;
  try {
    const json = await response.json();
    // FastAPI wraps our ErrorDetail under `detail` for HTTPException calls
    errorBody = json.detail ?? json;
  } catch {
    // Response wasn't JSON or was empty — fall through with no body
  }

  const code = errorBody?.error ?? `http_${response.status}`;
  const message =
    errorBody?.message ?? `Request failed with status ${response.status}`;
  const detail = errorBody?.detail ?? null;

  if (response.status >= 500) {
    throw new ServerError(code, message, response.status, detail);
  }
  throw new ClientError(code, message, response.status, detail);
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────

type FetchOptions = {
  method?: "GET" | "POST";
  body?: BodyInit;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

/**
 * Low-level fetch wrapper. All API functions go through this.
 * Returns the raw Response (so SSE handlers can read the stream).
 */
export async function apiFetch(
  path: string,
  options: FetchOptions = {},
): Promise<Response> {
  const url = `${config.apiUrl}${path}`;
  const headers = buildHeaders(options.headers);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      body: options.body,
      headers,
      signal: options.signal,
    });
  } catch (err) {
    // fetch() throws on network failures, never on HTTP errors
    const message = err instanceof Error ? err.message : "Request failed";
    throw new NetworkError(`Could not reach ${url}: ${message}`);
  }

  if (!response.ok) {
    await throwHttpError(response);
  }

  return response;
}

/**
 * Convenience wrapper for endpoints that return JSON of a known type.
 */
async function apiFetchJSON<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await apiFetch(path, options);
  return (await response.json()) as T;
}

// ─── Endpoint functions ─────────────────────────────────────────────────

/**
 * POST /api/parse
 * Upload a resume file (PDF, DOCX, TXT, MD, TEX) and get back extracted text.
 */
export async function parseFile(file: File): Promise<ParseResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetchJSON<ParseResponse>("/api/parse", {
    method: "POST",
    body: formData,
    // Don't set Content-Type — the browser sets it correctly with the multipart boundary
  });
}

/**
 * POST /api/fetch-jd
 * Fetch and clean a job description from a URL.
 */
export async function fetchJD(url: string): Promise<FetchJDResponse> {
  const body: FetchJDRequest = { url };

  return apiFetchJSON<FetchJDResponse>("/api/fetch-jd", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/analyze
 *
 * Streams analysis events from the backend. Yields typed events as they arrive:
 *   start → many text → result | parse_error | error → done
 *
 * Usage:
 *   for await (const event of analyzeStream(resumeText, jdText)) {
 *     switch (event.kind) {
 *       case "text": appendChunk(event.data.chunk); break;
 *       case "result": setFinalResult(event.data.result); break;
 *       ...
 *     }
 *   }
 */
export async function* analyzeStream(
  resumeText: string,
  jdText: string,
  signal?: AbortSignal,
): AsyncGenerator<AnalyzeStreamEvent> {
  const response = await apiFetch("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ resume_text: resumeText, jd_text: jdText }),
    headers: { "Content-Type": "application/json" },
    signal,
  });

  for await (const event of parseSSEStream(response)) {
    yield event;
  }
}
