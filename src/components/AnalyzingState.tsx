import type { FC } from "react";
import { Card } from "@/components/ui/card";

const AnalyzingState: FC = () => {
  return (
    <Card className="border border-rust-pale bg-rust-pale/40 p-8 shadow-none rounded-none">
      <div className="flex items-center gap-3 mb-4">
        <span className="block w-2 h-2 bg-rust rounded-full animate-pulse" />
        <p className="font-mono text-xs uppercase tracking-widest text-rust-deep">
          Analyzing
        </p>
      </div>

      <p className="text-base text-rust-deep leading-relaxed mb-2">
        Reading your resume against the job description.
      </p>

      <p className="font-mono text-xs text-rust-deep/70">
        Usually completes in 30 seconds. Streaming live from Claude.
      </p>
    </Card>
  );
};

export default AnalyzingState;
