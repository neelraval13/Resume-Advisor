/**
 * State machine for the analyze flow.
 *
 * States are mutually exclusive — the UI renders exactly one view per state.
 * Actions transition between states; invalid actions for the current state
 * are no-ops (defensive design).
 *
 * State graph:
 *   idle ──RESUME_PARSED──▶ idle (with resume)
 *   idle ──JD_PROVIDED──▶ idle (with jd)
 *   idle (with both) ──ANALYZE_START──▶ analyzing
 *   analyzing ──ANALYZE_SUCCESS──▶ results
 *   analyzing ──ANALYZE_ERROR──▶ error
 *   analyzing ──ANALYZE_PARSE_ERROR──▶ error (with raw_text)
 *   results | error ──RESET──▶ idle (preserves resume + jd)
 *   any ──CLEAR_RESUME──▶ idle (clears resume only)
 *   any ──CLEAR_JD──▶ idle (clears jd only)
 */
import type { AnalyzeResponse } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Helper for exhaustive switch defaults. If TypeScript has narrowed the value
 * to `never`, this can never actually be called at runtime — but if a new
 * variant is added without a case for it, this becomes a compile-time error.
 */
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

// ─── State ──────────────────────────────────────────────────────────────

export type AppState =
  | {
      status: "idle";
      resumeText: string | null;
      resumeFilename: string | null;
      jdText: string | null;
      jdSource: string | null; // url or 'pasted'
    }
  | {
      status: "analyzing";
      resumeText: string;
      resumeFilename: string;
      jdText: string;
      jdSource: string;
    }
  | {
      status: "results";
      results: AnalyzeResponse;
      // Keep input data so a "start over" can preserve it if needed
      resumeText: string;
      resumeFilename: string;
      jdText: string;
      jdSource: string;
    }
  | {
      status: "error";
      kind: "parse_error" | "stream_error" | "input_error";
      message: string;
      rawText?: string; // for parse_error — the malformed Claude output
      // Preserve inputs so user can retry without re-uploading
      resumeText: string | null;
      resumeFilename: string | null;
      jdText: string | null;
      jdSource: string | null;
    };

export const initialState: AppState = {
  status: "idle",
  resumeText: null,
  resumeFilename: null,
  jdText: null,
  jdSource: null,
};

// ─── Actions ────────────────────────────────────────────────────────────

export type Action =
  | { type: "RESUME_PARSED"; text: string; filename: string }
  | { type: "CLEAR_RESUME" }
  | { type: "JD_PROVIDED"; text: string; source: string }
  | { type: "CLEAR_JD" }
  | { type: "ANALYZE_START" }
  | { type: "ANALYZE_SUCCESS"; results: AnalyzeResponse }
  | {
      type: "ANALYZE_PARSE_ERROR";
      message: string;
      rawText: string;
    }
  | { type: "ANALYZE_STREAM_ERROR"; message: string }
  | { type: "RESET" };

// ─── Reducer ────────────────────────────────────────────────────────────

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "RESUME_PARSED": {
      // Parsing a new resume always returns to idle — even if we were showing
      // results, a new resume invalidates them.
      return {
        status: "idle",
        resumeText: action.text,
        resumeFilename: action.filename,
        jdText: state.jdText ?? null,
        jdSource: state.jdSource ?? null,
      };
    }

    case "CLEAR_RESUME": {
      return {
        status: "idle",
        resumeText: null,
        resumeFilename: null,
        jdText: state.jdText ?? null,
        jdSource: state.jdSource ?? null,
      };
    }

    case "JD_PROVIDED": {
      return {
        status: "idle",
        resumeText: state.resumeText ?? null,
        resumeFilename: state.resumeFilename ?? null,
        jdText: action.text,
        jdSource: action.source,
      };
    }

    case "CLEAR_JD": {
      return {
        status: "idle",
        resumeText: state.resumeText ?? null,
        resumeFilename: state.resumeFilename ?? null,
        jdText: null,
        jdSource: null,
      };
    }

    case "ANALYZE_START": {
      // Guard: only valid if both inputs are ready.
      if (
        !state.resumeText ||
        !state.resumeFilename ||
        !state.jdText ||
        !state.jdSource
      ) {
        return state;
      }
      return {
        status: "analyzing",
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        jdText: state.jdText,
        jdSource: state.jdSource,
      };
    }

    case "ANALYZE_SUCCESS": {
      // Guard: only valid mid-analysis.
      if (state.status !== "analyzing") return state;
      return {
        status: "results",
        results: action.results,
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        jdText: state.jdText,
        jdSource: state.jdSource,
      };
    }

    case "ANALYZE_PARSE_ERROR": {
      if (state.status !== "analyzing") return state;
      return {
        status: "error",
        kind: "parse_error",
        message: action.message,
        rawText: action.rawText,
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        jdText: state.jdText,
        jdSource: state.jdSource,
      };
    }

    case "ANALYZE_STREAM_ERROR": {
      if (state.status !== "analyzing") return state;
      return {
        status: "error",
        kind: "stream_error",
        message: action.message,
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        jdText: state.jdText,
        jdSource: state.jdSource,
      };
    }

    case "RESET": {
      // Clear results/errors, preserve inputs so user can re-analyze without re-uploading.
      return {
        status: "idle",
        resumeText: state.resumeText ?? null,
        resumeFilename: state.resumeFilename ?? null,
        jdText: state.jdText ?? null,
        jdSource: state.jdSource ?? null,
      };
    }

    default: {
      return assertNever(action);
    }
  }
}

// ─── Selectors (computed values from state) ─────────────────────────────

export function canAnalyze(state: AppState): boolean {
  return (
    state.status === "idle" &&
    !!state.resumeText &&
    !!state.jdText &&
    state.resumeText.length > 100 && // sanity check — backend will also validate
    state.jdText.length > 100
  );
}
