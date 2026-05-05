import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APIError, parseFile } from "@/lib/api";

type ResumeInputProps = {
  resumeText: string | null;
  resumeFilename: string | null;
  onParsed: (text: string, filename: string) => void;
  onCleared: () => void;
};

const ResumeInput: FC<ResumeInputProps> = ({
  resumeText,
  resumeFilename,
  onParsed,
  onCleared,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const result = await parseFile(file);
      onParsed(result.text, result.metadata.filename);
    } catch (err) {
      const message =
        err instanceof APIError
          ? err.message
          : "Could not parse the file. Try a different format.";
      setError(message);
    } finally {
      setIsParsing(false);
      // Clear the input so the same file can be re-uploaded if needed
      event.target.value = "";
    }
  }

  // Display state: parsed file shown as a card with filename + clear button
  if (resumeText && resumeFilename) {
    return (
      <Card className="border border-rule p-4 shadow-none rounded-none flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
            Resume
          </p>
          <p className="text-sm truncate">{resumeFilename}</p>
          <p className="font-mono text-xs text-ink-faint mt-1">
            {resumeText.length.toLocaleString()} characters
          </p>
        </div>
        <Button
          onClick={onCleared}
          variant="ghost"
          size="sm"
          className="font-mono text-xs uppercase tracking-widest rounded-none text-ink-muted hover:bg-paper hover:text-ink"
        >
          Replace
        </Button>
      </Card>
    );
  }

  // Empty state: file picker
  return (
    <div className="border border-rule border-dashed p-6">
      <label className="font-mono text-xs uppercase tracking-widest text-ink-faint block mb-3">
        Upload resume
      </label>

      <input
        type="file"
        accept=".pdf,.docx,.txt,.md,.tex"
        onChange={handleFileChange}
        disabled={isParsing}
        className="font-mono text-sm w-full file:mr-4 file:py-2 file:px-4 file:border file:border-rule file:bg-paper-warm file:text-ink-muted file:font-mono file:text-xs file:uppercase file:tracking-widest hover:file:bg-paper hover:file:text-ink file:cursor-pointer cursor-pointer disabled:opacity-50"
      />

      <p className="font-mono text-xs text-ink-faint mt-3">
        PDF, DOCX, TXT, MD, or TEX. Maximum 10 MB.
      </p>

      {isParsing && (
        <p className="font-mono text-xs uppercase tracking-widest text-rust mt-3">
          Parsing...
        </p>
      )}

      {error && (
        <p className="font-mono text-xs text-rust-deep bg-rust-pale border-l-2 border-rust pl-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  );
};

export default ResumeInput;
