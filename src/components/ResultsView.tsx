import type { FC } from "react";
import FitScore from "@/components/FitScore";
import FullRewrite from "@/components/FullRewrite";
import LineEditCard from "@/components/LineEditCard";
import RedFlag from "@/components/RedFlag";
import SkillGapCard from "@/components/SkillGapCard";
import StrengthCard from "@/components/StrengthCard";
import StructuralSuggestion from "@/components/StructuralSuggestion";
import type { AnalyzeResponse } from "@/lib/types";

type ResultsViewProps = {
  results: AnalyzeResponse;
};

const ResultsView: FC<ResultsViewProps> = ({ results }) => {
  // Sort gaps so critical urgency comes first.
  const sortedGaps = [...results.skill_gap_recommendations].sort((a, b) => {
    const order: Record<string, number> = {
      critical: 0,
      helpful: 1,
      optional: 2,
    };
    return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
  });

  return (
    <>
      <FitScore fitAssessment={results.fit_assessment} />

      {results.strengths_to_emphasize.length > 0 && (
        <Section label="Strengths to emphasize">
          <div className="space-y-6">
            {results.strengths_to_emphasize.map((strength, i) => (
              <StrengthCard key={i} strength={strength} index={i} />
            ))}
          </div>
        </Section>
      )}

      {results.line_edits.length > 0 && (
        <Section label="Line edits">
          <div className="space-y-4">
            {results.line_edits.map((edit, i) => (
              <LineEditCard key={i} edit={edit} />
            ))}
          </div>
        </Section>
      )}

      {results.structural_suggestions.length > 0 && (
        <Section label="Structural suggestions">
          <div>
            {results.structural_suggestions.map((suggestion, i) => (
              <StructuralSuggestion key={i} suggestion={suggestion} />
            ))}
          </div>
        </Section>
      )}

      {sortedGaps.length > 0 && (
        <Section label="Skill gaps">
          <div className="space-y-4">
            {sortedGaps.map((gap, i) => (
              <SkillGapCard key={i} gap={gap} />
            ))}
          </div>
        </Section>
      )}

      {results.red_flags.length > 0 && (
        <Section label="Honest concerns">
          <div className="bg-rust-pale border border-rust p-6">
            {results.red_flags.map((flag, i) => (
              <RedFlag key={i} flag={flag} index={i} />
            ))}
          </div>
        </Section>
      )}

      {results.full_rewrite_if_requested && (
        <FullRewrite rewrite={results.full_rewrite_if_requested} />
      )}
    </>
  );
};

/** Internal helper — consistent section header styling across results. */
type SectionProps = {
  label: string;
  children: React.ReactNode;
};

const Section: FC<SectionProps> = ({ label, children }) => {
  return (
    <section className="mb-12">
      <h2 className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
        {label}
      </h2>
      {children}
    </section>
  );
};

export default ResultsView;
