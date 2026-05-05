import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ErrorViewProps = {
  kind: "parse_error" | "stream_error" | "input_error";
  message: string;
  rawText?: string;
  onRetry: () => void;
  onReset: () => void;
};

const ErrorView: FC<ErrorViewProps> = ({
  kind,
  message,
  rawText,
  onRetry,
  onReset,
}) => {
  return (
    <Card className="border border-rust bg-rust-pale p-8 shadow-none rounded-none mb-12">
      <p className="font-mono text-xs uppercase tracking-widest text-rust-deep mb-3">
        {kind === "parse_error" && "Malformed response"}
        {kind === "stream_error" && "Stream error"}
        {kind === "input_error" && "Input error"}
      </p>

      <p className="text-base text-rust-deep leading-relaxed mb-4">{message}</p>

      {kind === "parse_error" && (
        <p className="text-sm text-rust-deep/80 italic mb-4">
          Claude returned a response that didn&apos;t match the expected
          structure. This happens occasionally (about 1-3% of calls). Try again
          — the next attempt will likely succeed.
        </p>
      )}

      {kind === "stream_error" && (
        <p className="text-sm text-rust-deep/80 italic mb-4">
          The connection to the analysis service failed. Check your internet and
          try again.
        </p>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          onClick={onRetry}
          className="font-mono text-xs uppercase tracking-widest rounded-none bg-rust text-paper hover:bg-rust-deep"
        >
          Try again
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          className="font-mono text-xs uppercase tracking-widest rounded-none text-rust-deep hover:bg-rust-pale/60"
        >
          Start over
        </Button>
      </div>

      {rawText && (
        <details className="mt-6 border-t border-rust/30 pt-4">
          <summary className="font-mono text-xs uppercase tracking-widest text-rust-deep/70 cursor-pointer hover:text-rust-deep">
            Show raw response (debug)
          </summary>
          <pre className="font-mono text-xs text-rust-deep/80 bg-paper/50 p-4 mt-3 overflow-x-auto whitespace-pre-wrap">
            {rawText}
          </pre>
        </details>
      )}
    </Card>
  );
};

export default ErrorView;
