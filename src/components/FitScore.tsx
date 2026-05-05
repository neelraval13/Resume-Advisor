import type { FC } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FitAssessment } from "@/lib/types";

type FitScoreProps = {
  fitAssessment: FitAssessment;
};

/** Map a 0-100 score to a verdict + visual tone. */
function scoreVerdict(score: number): {
  label: string;
  description: string;
  tone: "rust" | "amber" | "olive";
} {
  if (score < 40) {
    return {
      label: "Weak fit",
      description: "Significant gaps; honest about whether this role is right",
      tone: "rust",
    };
  }
  if (score < 70) {
    return {
      label: "Mixed fit",
      description: "Real strengths and real gaps; tailoring will help",
      tone: "amber",
    };
  }
  return {
    label: "Strong fit",
    description: "Solid match; tailoring is polish, not transformation",
    tone: "olive",
  };
}

const FitScore: FC<FitScoreProps> = ({ fitAssessment }) => {
  const { score, narrative } = fitAssessment;
  const verdict = scoreVerdict(score);

  const toneStyles = {
    rust: {
      bg: "bg-rust-pale",
      accent: "text-rust-deep",
      border: "border-rust",
    },
    amber: {
      bg: "bg-amber-pale",
      accent: "text-amber-deep",
      border: "border-amber-deep/40",
    },
    olive: {
      bg: "bg-olive-pale",
      accent: "text-olive-deep",
      border: "border-olive-deep/40",
    },
  }[verdict.tone];

  return (
    <Card
      className={cn(
        "border p-8 mb-12 shadow-none rounded-none",
        toneStyles.bg,
        toneStyles.border,
      )}
    >
      <div className="flex items-baseline gap-6 mb-4">
        <div
          className={cn(
            "text-7xl font-normal tracking-tight",
            toneStyles.accent,
          )}
        >
          {score}
        </div>
        <div className="flex flex-col">
          <p
            className={cn(
              "font-mono text-xs uppercase tracking-widest mb-1",
              toneStyles.accent,
            )}
          >
            Fit assessment
          </p>
          <p className={cn("text-2xl italic font-normal", toneStyles.accent)}>
            {verdict.label}
          </p>
        </div>
      </div>

      <p className={cn("text-base leading-relaxed mb-3", toneStyles.accent)}>
        {narrative}
      </p>

      <p
        className={cn(
          "font-mono text-xs uppercase tracking-widest opacity-60",
          toneStyles.accent,
        )}
      >
        {verdict.description}
      </p>
    </Card>
  );
};

export default FitScore;
