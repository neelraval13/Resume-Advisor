import type { FC } from "react";
import { useReducer, useState } from "react";
import AnalyzingState from "@/components/AnalyzingState";
import ErrorView from "@/components/ErrorView";
import JDInput from "@/components/JDInput";
import Layout from "@/components/Layout";
import ResultsView from "@/components/ResultsView";
import ResumeInput from "@/components/ResumeInput";
import { Button } from "@/components/ui/button";
import { APIError, analyzeStream } from "@/lib/api";
import { canAnalyze, initialState, reducer } from "@/lib/state";

const App: FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Track whether an analyze is currently running, separately from state.
  // This lets us avoid double-fires if the button is clicked twice fast.
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function runAnalyze() {
    if (isAnalyzing) return;
    if (!state.resumeText || !state.jdText) return;

    setIsAnalyzing(true);
    dispatch({ type: "ANALYZE_START" });

    try {
      // Iterate the SSE stream. Each event updates state appropriately.
      for await (const event of analyzeStream(state.resumeText, state.jdText)) {
        switch (event.kind) {
          case "result":
            dispatch({ type: "ANALYZE_SUCCESS", results: event.data.result });
            break;

          case "parse_error":
            dispatch({
              type: "ANALYZE_PARSE_ERROR",
              message: event.data.message,
              rawText: event.data.raw_text,
            });
            break;

          case "error":
            dispatch({
              type: "ANALYZE_STREAM_ERROR",
              message: event.data.message,
            });
            break;

          // start, text, done events are intentionally ignored — the UI doesn't
          // need them with our "wait until full result" approach.
          case "start":
          case "text":
          case "done":
            break;
        }
      }
    } catch (err) {
      const message =
        err instanceof APIError
          ? err.message
          : "Connection failed. Check your network and try again.";
      dispatch({ type: "ANALYZE_STREAM_ERROR", message });
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Layout>
      <header className="mb-12">
        <h1 className="font-heading text-6xl font-normal tracking-tight leading-none mb-2">
          <em className="text-rust font-normal">Jogen</em>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          Tailoring advice from Claude
        </p>
      </header>

      {/* Idle: inputs + analyze button */}
      {state.status === "idle" && (
        <div className="space-y-6">
          <ResumeInput
            resumeText={state.resumeText}
            resumeFilename={state.resumeFilename}
            onParsed={(text, filename) =>
              dispatch({ type: "RESUME_PARSED", text, filename })
            }
            onCleared={() => dispatch({ type: "CLEAR_RESUME" })}
          />

          <JDInput
            jdText={state.jdText}
            jdSource={state.jdSource}
            onProvided={(text, source) =>
              dispatch({ type: "JD_PROVIDED", text, source })
            }
            onCleared={() => dispatch({ type: "CLEAR_JD" })}
          />

          <div className="pt-4">
            <Button
              onClick={runAnalyze}
              disabled={!canAnalyze(state)}
              className="font-mono text-sm uppercase tracking-widest rounded-none bg-ink text-paper hover:bg-rust px-8 py-6 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Analyze
            </Button>
            {!canAnalyze(state) && (
              <p className="font-mono text-xs text-ink-faint mt-3">
                Add both a resume and a job description to begin.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Analyzing: streaming */}
      {state.status === "analyzing" && <AnalyzingState />}

      {/* Results */}
      {state.status === "results" && (
        <>
          <ResultsView results={state.results} />

          <div className="mt-12 pt-8 border-t border-rule-soft">
            <Button
              onClick={() => dispatch({ type: "RESET" })}
              variant="ghost"
              className="font-mono text-xs uppercase tracking-widest rounded-none text-ink-muted hover:text-ink hover:bg-paper-warm"
            >
              Analyze a different role
            </Button>
          </div>
        </>
      )}

      {/* Error */}
      {state.status === "error" && (
        <ErrorView
          kind={state.kind}
          message={state.message}
          rawText={state.rawText}
          onRetry={runAnalyze}
          onReset={() => dispatch({ type: "RESET" })}
        />
      )}
    </Layout>
  );
};

export default App;
