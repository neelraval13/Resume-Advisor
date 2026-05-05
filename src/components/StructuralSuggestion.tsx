import type { FC } from "react";
import type { StructuralSuggestion as StructuralSuggestionType } from "@/lib/types";

type StructuralSuggestionProps = {
  suggestion: StructuralSuggestionType;
};

const StructuralSuggestion: FC<StructuralSuggestionProps> = ({
  suggestion,
}) => {
  return (
    <article className="flex gap-4 py-4 border-b border-rule-soft last:border-b-0">
      <div className="font-mono text-xs uppercase tracking-widest text-ink-faint shrink-0 w-20 mt-1">
        Restructure
      </div>
      <div className="flex-1">
        <p className="text-base mb-1">{suggestion.change}</p>
        <p className="text-sm italic text-ink-muted">{suggestion.rationale}</p>
      </div>
    </article>
  );
};

export default StructuralSuggestion;
