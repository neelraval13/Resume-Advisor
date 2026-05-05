import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APIError, fetchJD } from "@/lib/api";

type JDInputProps = {
  jdText: string | null;
  jdSource: string | null;
  onProvided: (text: string, source: string) => void;
  onCleared: () => void;
};

type Mode = "url" | "paste";

const JDInput: FC<JDInputProps> = ({
  jdText,
  jdSource,
  onProvided,
  onCleared,
}) => {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    if (!url.trim()) return;
    setIsFetching(true);
    setError(null);

    try {
      const result = await fetchJD(url.trim());
      onProvided(result.text, result.metadata.source_url);
      setUrl("");
    } catch (err) {
      const message =
        err instanceof APIError
          ? err.message
          : "Could not fetch the URL. Paste the text instead.";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }

  function handlePasteSubmit() {
    if (pasted.trim().length < 100) {
      setError("Paste at least a paragraph of the job description.");
      return;
    }
    setError(null);
    onProvided(pasted.trim(), "pasted");
    setPasted("");
  }

  // Loaded state
  if (jdText && jdSource) {
    return (
      <Card className="border border-rule p-4 shadow-none rounded-none flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
            Job description
          </p>
          <p className="text-sm truncate">
            {jdSource === "pasted" ? "Pasted text" : jdSource}
          </p>
          <p className="font-mono text-xs text-ink-faint mt-1">
            {jdText.length.toLocaleString()} characters
          </p>
        </div>
        <Button
          onClick={onCleared}
          variant="ghost"
          size="sm"
          className="font-mono text-xs uppercase tracking-widest rounded-none text-ink-muted hover:bg-paper hover:text-ink shrink-0"
        >
          Replace
        </Button>
      </Card>
    );
  }

  // Empty state with mode toggle
  return (
    <div className="border border-rule border-dashed p-6">
      <label className="font-mono text-xs uppercase tracking-widest text-ink-faint block mb-3">
        Job description
      </label>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => {
            setMode("url");
            setError(null);
          }}
          className={cn(
            "font-mono text-xs uppercase tracking-widest px-3 py-2 transition-colors",
            mode === "url"
              ? "bg-ink text-paper"
              : "bg-paper-warm text-ink-muted hover:bg-paper hover:text-ink",
          )}
        >
          From URL
        </button>
        <button
          onClick={() => {
            setMode("paste");
            setError(null);
          }}
          className={cn(
            "font-mono text-xs uppercase tracking-widest px-3 py-2 transition-colors",
            mode === "paste"
              ? "bg-ink text-paper"
              : "bg-paper-warm text-ink-muted hover:bg-paper hover:text-ink",
          )}
        >
          Paste text
        </button>
      </div>

      {mode === "url" && (
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://company.com/jobs/role-title"
            disabled={isFetching}
            className="w-full px-3 py-2 border border-rule bg-paper-warm font-mono text-sm focus:outline-none focus:border-rust disabled:opacity-50"
          />
          <Button
            onClick={handleFetch}
            disabled={isFetching || !url.trim()}
            className="font-mono text-xs uppercase tracking-widest rounded-none bg-ink text-paper hover:bg-rust disabled:opacity-30"
          >
            {isFetching ? "Fetching..." : "Fetch JD"}
          </Button>
          <p className="font-mono text-xs text-ink-faint">
            Greenhouse, Lever, and most company job pages work. LinkedIn and
            login-walled pages will fail — paste the text instead.
          </p>
        </div>
      )}

      {mode === "paste" && (
        <div className="space-y-3">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            className="w-full px-3 py-2 border border-rule bg-paper-warm text-sm leading-relaxed focus:outline-none focus:border-rust resize-y"
          />
          <Button
            onClick={handlePasteSubmit}
            disabled={!pasted.trim()}
            className="font-mono text-xs uppercase tracking-widest rounded-none bg-ink text-paper hover:bg-rust disabled:opacity-30"
          >
            Use this text
          </Button>
        </div>
      )}

      {error && (
        <p className="font-mono text-xs text-rust-deep bg-rust-pale border-l-2 border-rust pl-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  );
};

export default JDInput;
