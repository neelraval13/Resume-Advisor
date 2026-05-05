import type { FC } from "react";
import type { Strength } from "@/lib/types";

type StrengthCardProps = {
  strength: Strength;
  index: number;
};

const StrengthCard: FC<StrengthCardProps> = ({ strength, index }) => {
  return (
    <article className="border-l-2 border-olive-deep pl-5 py-1">
      <p className="font-mono text-xs uppercase tracking-widest text-olive-deep mb-2">
        Strength {index + 1}
      </p>

      <p className="text-lg leading-tight font-normal mb-3">
        {strength.strength}
      </p>

      <dl className="space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="font-mono text-xs uppercase tracking-widest text-ink-faint shrink-0 mt-1">
            Where
          </dt>
          <dd className="text-ink-muted">{strength.current_location}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-mono text-xs uppercase tracking-widest text-ink-faint shrink-0 mt-1">
            Match
          </dt>
          <dd className="text-ink-muted italic">{strength.jd_match}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-mono text-xs uppercase tracking-widest text-ink-faint shrink-0 mt-1">
            Action
          </dt>
          <dd className="text-ink">{strength.action}</dd>
        </div>
      </dl>
    </article>
  );
};

export default StrengthCard;
