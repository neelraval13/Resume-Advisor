/**
 * Server-Sent Events parser for the /api/analyze endpoint.
 *
 * Browser's built-in EventSource doesn't support POST or custom headers,
 * so we read the response body as a ReadableStream and parse the SSE
 * wire format manually.
 *
 * Wire format (per W3C):
 *   event: <name>
 *   data: <json payload>
 *   <empty line ends one event>
 *
 * This module exposes one function: parseSSEStream(), an async generator
 * that yields parsed AnalyzeStreamEvents until the stream closes.
 */
import type {
  AnalyzeStreamEvent,
  DoneEvent,
  ErrorEvent,
  ParseErrorEvent,
  ResultEvent,
  StartEvent,
  TextEvent,
} from "./types";

/** Raw event coming off the wire — name + JSON-string data. */
type RawSSEEvent = {
  event: string;
  data: string;
};

/**
 * Read bytes from a ReadableStream, decode to text, parse SSE-formatted
 * events, and yield raw {event, data} pairs until the stream closes.
 *
 * Handles the case where chunks don't align with event boundaries — events
 * may span multiple chunks; chunks may contain multiple events.
 */
async function* readRawEvents(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<RawSSEEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append decoded chunk to the buffer. `stream: true` keeps any partial
      // multi-byte UTF-8 sequence intact across chunks.
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by blank lines (\n\n). Pull off complete
      // events; leave any trailing partial event in the buffer.
      let separatorIndex: number;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);

        const parsed = parseEventBlock(rawEvent);
        if (parsed) {
          yield parsed;
        }
      }
    }

    // Stream closed — flush any final partial event in the buffer.
    if (buffer.trim()) {
      const parsed = parseEventBlock(buffer);
      if (parsed) {
        yield parsed;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Parse a single event block (one or more lines, no trailing blank line). */
function parseEventBlock(block: string): RawSSEEvent | null {
  let event = "";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (line.startsWith(":")) continue; // comment, skip
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
    // Other SSE fields (id:, retry:) are spec-valid but we don't use them.
  }

  if (!event) return null; // skip events without a name (e.g., heartbeat comments)
  return { event, data: dataLines.join("\n") };
}

/**
 * Parse a raw SSE event into a typed AnalyzeStreamEvent.
 * Returns null if the event name is unknown — caller can decide to skip
 * unknown events or surface them as warnings.
 */
function parseTypedEvent(raw: RawSSEEvent): AnalyzeStreamEvent | null {
  let payload: unknown;
  try {
    payload = JSON.parse(raw.data);
  } catch {
    // Malformed JSON in an event payload — surface as an error event so the
    // UI doesn't silently drop information.
    return {
      kind: "error",
      data: {
        error: "malformed_event_payload",
        message: `Could not parse JSON for event '${raw.event}': ${raw.data.slice(0, 200)}`,
      },
    };
  }

  switch (raw.event) {
    case "start":
      return { kind: "start", data: payload as StartEvent };
    case "text":
      return { kind: "text", data: payload as TextEvent };
    case "result":
      return { kind: "result", data: payload as ResultEvent };
    case "parse_error":
      return { kind: "parse_error", data: payload as ParseErrorEvent };
    case "error":
      return { kind: "error", data: payload as ErrorEvent };
    case "done":
      return { kind: "done", data: payload as DoneEvent };
    default:
      return null;
  }
}

/**
 * Public API. Takes a fetch Response (from POST /api/analyze) and yields
 * typed events until the stream closes.
 *
 * Usage:
 *   for await (const event of parseSSEStream(response)) {
 *     switch (event.kind) {
 *       case "start": ...
 *       case "text": ...
 *       case "result": ...
 *     }
 *   }
 */
export async function* parseSSEStream(
  response: Response,
): AsyncGenerator<AnalyzeStreamEvent> {
  if (!response.body) {
    throw new Error("Response has no body to stream");
  }

  for await (const raw of readRawEvents(response.body)) {
    const typed = parseTypedEvent(raw);
    if (typed) {
      yield typed;
    }
    // Unknown events are silently dropped. If we ever add new event types
    // server-side, the type system will flag missing cases here.
  }
}
