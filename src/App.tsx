import type { FC } from "react";
import { useState } from "react";
import { analyzeStream, fetchJD, parseFile } from "./lib/api";
import type { APIError } from "./lib/api";
import type { AnalyzeResponse } from "./lib/types";

const App: FC = () => {
  const [resumeText, setResumeText] = useState<string>("");
  const [jdText, setJdText] = useState<string>("");
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function appendLog(line: string) {
    setStreamLog((prev) => [...prev, line]);
  }

  async function handleParseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await parseFile(file);
      setResumeText(result.text);
      appendLog(
        `✓ Parsed ${result.metadata.filename} (${result.metadata.char_count} chars)`,
      );
    } catch (err) {
      appendLog(`✗ Parse error: ${(err as APIError).message}`);
    }
  }

  async function handleFetchJD() {
    const url = "https://job-boards.greenhouse.io/anthropic/jobs/4980436008";
    try {
      const result = await fetchJD(url);
      setJdText(result.text);
      appendLog(
        `✓ Fetched JD: ${result.metadata.title} (${result.metadata.char_count} chars)`,
      );
    } catch (err) {
      appendLog(`✗ Fetch error: ${(err as APIError).message}`);
    }
  }

  async function handleAnalyze() {
    if (!resumeText || !jdText) {
      appendLog("✗ Need both resume and JD text first");
      return;
    }
    setIsAnalyzing(true);
    setFinalResult(null);
    appendLog("→ Starting analysis...");

    try {
      let textChunks = 0;
      for await (const event of analyzeStream(resumeText, jdText)) {
        switch (event.kind) {
          case "start":
            appendLog(`✓ start: model=${event.data.model}`);
            break;
          case "text":
            textChunks++;
            // Log every 10th chunk to avoid spam
            if (textChunks % 10 === 0) {
              appendLog(`  …${textChunks} text chunks received`);
            }
            break;
          case "result":
            appendLog(
              `✓ result: score=${event.data.result.fit_assessment.score}`,
            );
            setFinalResult(event.data.result);
            break;
          case "parse_error":
            appendLog(`✗ parse_error: ${event.data.message}`);
            break;
          case "error":
            appendLog(`✗ error: ${event.data.error} — ${event.data.message}`);
            break;
          case "done":
            appendLog(`✓ done: ${event.data.duration_ms}ms total`);
            break;
        }
      }
    } catch (err) {
      appendLog(`✗ Stream error: ${(err as APIError).message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-normal tracking-tight leading-none mb-2">
          Resume <em className="text-rust font-normal">Advisor</em>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-8">
          SSE smoke test
        </p>

        <div className="space-y-3 mb-8">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-ink-faint block mb-2">
              1. Upload resume
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,.tex"
              onChange={handleParseFile}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <button
              onClick={handleFetchJD}
              className="font-mono text-xs uppercase tracking-widest bg-paper-warm border border-rule px-6 py-3 hover:border-rust transition-colors"
            >
              2. Fetch sample JD (Anthropic Interpretability)
            </button>
          </div>

          <div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText || !jdText}
              className="font-mono text-xs uppercase tracking-widest bg-ink text-paper px-6 py-3 hover:bg-rust transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "Analyzing..." : "3. Analyze"}
            </button>
          </div>
        </div>

        <div className="bg-paper-warm border border-rule p-4 font-mono text-xs whitespace-pre-wrap mb-6">
          {streamLog.length === 0 ? "(no events yet)" : streamLog.join("\n")}
        </div>

        {finalResult && (
          <div className="bg-rust-pale border border-rust p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-rust-deep mb-3">
              Final result — score {finalResult.fit_assessment.score}/100
            </p>
            <p className="text-base text-rust-deep italic mb-4">
              {finalResult.fit_assessment.narrative}
            </p>
            <p className="font-mono text-xs text-rust-deep">
              {finalResult.line_edits.length} line edits ·{" "}
              {finalResult.skill_gap_recommendations.length} skill gap
              recommendations · {finalResult.red_flags.length} red flags
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
