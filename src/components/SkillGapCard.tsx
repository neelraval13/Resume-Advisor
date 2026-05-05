import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GapType, SkillGapRecommendation, Urgency } from "@/lib/types";

type SkillGapCardProps = {
  gap: SkillGapRecommendation;
};

/** Urgency -> badge styling. Critical = rust, helpful = amber, optional = muted ink. */
function urgencyStyles(urgency: Urgency): { className: string; label: string } {
  switch (urgency) {
    case "critical":
      return {
        className: "bg-rust text-paper hover:bg-rust",
        label: "Critical",
      };
    case "helpful":
      return {
        className: "bg-amber-deep text-paper hover:bg-amber-deep",
        label: "Helpful",
      };
    case "optional":
      return {
        className: "bg-ink-muted text-paper hover:bg-ink-muted",
        label: "Optional",
      };
  }
}

/** Gap type -> human-readable label. */
function typeLabel(type: GapType): string {
  switch (type) {
    case "project":
      return "Project";
    case "course":
      return "Course";
    case "certification":
      return "Certification";
    case "community":
      return "Community";
    case "reading":
      return "Reading";
    case "other":
      return "Other";
  }
}

const SkillGapCard: FC<SkillGapCardProps> = ({ gap }) => {
  const urgency = urgencyStyles(gap.urgency);

  return (
    <Card className="border border-rule p-6 shadow-none rounded-none">
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-lg leading-tight font-normal flex-1">{gap.gap}</p>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge
            className={cn(
              "font-mono text-xs uppercase tracking-widest rounded-none",
              urgency.className,
            )}
          >
            {urgency.label}
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs uppercase tracking-widest rounded-none border-rule text-ink-muted"
          >
            {typeLabel(gap.type)}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
            Action
          </p>
          <p className="text-base text-ink leading-relaxed">{gap.action}</p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
            Effort
          </p>
          <p className="text-sm text-ink-muted italic">{gap.effort_estimate}</p>
        </div>
      </div>

      <div className="bg-rust-pale border-l-2 border-rust p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-rust-deep mb-2">
          This week
        </p>
        <p className="text-base text-rust-deep leading-relaxed">
          {gap.concrete_starter}
        </p>
      </div>
    </Card>
  );
};

export default SkillGapCard;
