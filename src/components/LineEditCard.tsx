import type { FC } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LineEdit, Priority } from "@/lib/types";

type LineEditCardProps = {
  edit: LineEdit;
};

/** Priority -> visual treatment for the badge. */
function priorityBadgeStyles(priority: Priority): string {
  switch (priority) {
    case "high":
      return "bg-rust text-paper hover:bg-rust";
    case "medium":
      return "bg-amber-deep text-paper hover:bg-amber-deep";
    case "low":
      return "bg-ink-muted text-paper hover:bg-ink-muted";
  }
}

function priorityLabel(priority: Priority): string {
  switch (priority) {
    case "high":
      return "High priority";
    case "medium":
      return "Medium priority";
    case "low":
      return "Low priority";
  }
}

const LineEditCard: FC<LineEditCardProps> = ({ edit }) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(edit.suggested_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail on insecure origins or denied permissions.
      // Silently degrade — the user can still select-copy manually.
    }
  }

  return (
    <Card className="border border-rule p-6 shadow-none rounded-none">
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          {edit.section}
        </p>
        <Badge
          className={cn(
            "font-mono text-xs uppercase tracking-widest rounded-none shrink-0",
            priorityBadgeStyles(edit.priority),
          )}
        >
          {priorityLabel(edit.priority)}
        </Badge>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-2">
            Current
          </p>
          <p className="text-sm leading-relaxed text-ink-muted line-through decoration-ink-faint/40">
            {edit.current_text}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs uppercase tracking-widest text-rust">
              Suggested
            </p>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className={cn(
                "font-mono text-xs uppercase tracking-widest rounded-none h-auto py-1 px-3",
                copied
                  ? "bg-olive-pale text-olive-deep hover:bg-olive-pale"
                  : "bg-paper-warm text-ink-muted hover:bg-paper hover:text-ink",
              )}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-base leading-relaxed text-ink">
            {edit.suggested_text}
          </p>
        </div>
      </div>

      <p className="text-sm italic text-ink-muted border-t border-rule-soft pt-3">
        {edit.rationale}
      </p>
    </Card>
  );
};

export default LineEditCard;
