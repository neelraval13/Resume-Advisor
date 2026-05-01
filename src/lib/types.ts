import type { components } from "./api-types";

// ─── Auto-generated from OpenAPI (parse + fetch-jd + health) ────────────
// These come straight from the generated api-types.ts. Regenerate via:
//   pnpm types:gen
//
// Source of truth: backend Pydantic models exposed via FastAPI route signatures.

type Schemas = components["schemas"];

export type HealthResponse = Schemas["HealthResponse"];
export type ErrorDetail = Schemas["ErrorDetail"];

// Parse endpoint
export type ParseResponse = Schemas["ParseResponse"];
export type ParseMetadata = Schemas["ParseMetadata"];
export type FileKind = Schemas["FileKind"];
export type ParseWarning = Schemas["ParseWarning"];

// Fetch JD endpoint
export type FetchJDRequest = Schemas["FetchJDRequest"];
export type FetchJDResponse = Schemas["FetchJDResponse"];
export type FetchJDMetadata = Schemas["FetchJDMetadata"];
export type FetchWarning = Schemas["FetchWarning"];

// Analyze endpoint request (this one DID generate)
export type AnalyzeRequest = Schemas["AnalyzeRequest"];

// ─── Hand-typed (analyze response + SSE events) ─────────────────────────
// These mirror Pydantic models in app/schemas.py that aren't currently
// reachable through any route signature, so FastAPI's auto-OpenAPI generator
// doesn't include them. When the backend's analyze schemas change, these
// types must be updated by hand.
//
// TODO: add a documentation-only route to the backend that exposes
// AnalyzeResponse via response_model=, then regenerate and delete this block.

export type Priority = "high" | "medium" | "low";
export type GapType =
  | "project"
  | "course"
  | "certification"
  | "community"
  | "reading"
  | "other";
export type Urgency = "critical" | "helpful" | "optional";

export type FitAssessment = {
  score: number; // 0-100
  narrative: string;
};

export type Strength = {
  strength: string;
  current_location: string;
  jd_match: string;
  action: string;
};

export type LineEdit = {
  section: string;
  current_text: string;
  suggested_text: string;
  rationale: string;
  priority: Priority;
};

export type StructuralSuggestion = {
  change: string;
  rationale: string;
};

export type SkillGapRecommendation = {
  gap: string;
  action: string;
  type: GapType;
  effort_estimate: string;
  urgency: Urgency;
  concrete_starter: string;
};

export type AnalyzeResponse = {
  fit_assessment: FitAssessment;
  strengths_to_emphasize: Strength[];
  line_edits: LineEdit[];
  structural_suggestions: StructuralSuggestion[];
  skill_gap_recommendations: SkillGapRecommendation[];
  red_flags: string[];
  full_rewrite_if_requested: string | null;
};

// ─── Hand-typed SSE event payloads ──────────────────────────────────────
// Each event over the /api/analyze SSE stream has a typed payload.
// These mirror app/schemas.py (StartEvent, TextEvent, etc.) which aren't
// in OpenAPI for the same reason as AnalyzeResponse.

export type StartEvent = {
  model: string;
  started_at: string; // ISO 8601 timestamp
};

export type TextEvent = {
  chunk: string;
};

export type ResultEvent = {
  result: AnalyzeResponse;
};

export type ParseErrorEvent = {
  error: "malformed_response";
  message: string;
  raw_text: string;
};

export type ErrorEvent = {
  error: string;
  message: string;
  detail?: string | null;
};

export type DoneEvent = {
  completed_at: string;
  duration_ms: number;
};

/** A discriminated union covering every SSE event kind the analyze endpoint emits. */
export type AnalyzeStreamEvent =
  | { kind: "start"; data: StartEvent }
  | { kind: "text"; data: TextEvent }
  | { kind: "result"; data: ResultEvent }
  | { kind: "parse_error"; data: ParseErrorEvent }
  | { kind: "error"; data: ErrorEvent }
  | { kind: "done"; data: DoneEvent };
