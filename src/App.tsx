import type { FC } from "react";

const App: FC = () => {
  return (
    <div className="min-h-screen px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-3">
          Odyssey Therapeia · style test · v0.1
        </p>
        <h1 className="text-6xl font-normal tracking-tight leading-none mb-3">
          Resume <em className="text-rust font-normal">Advisor</em>
        </h1>
        <p className="text-base text-ink-muted italic">
          If you're reading this in Fraunces serif on a warm paper background
          with a rust accent on "Advisor" — Tailwind is wired up correctly.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-paper-warm border border-rule p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-2">
              Color check
            </p>
            <p className="text-sm">
              Inks, rust, paper — all rendering as design tokens.
            </p>
          </div>
          <div className="bg-olive-pale border border-olive-deep/30 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-olive-deep mb-2">
              Olive variant
            </p>
            <p className="text-sm text-olive-deep">
              For matched keywords later.
            </p>
          </div>
          <div className="bg-rust-pale border border-rust p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-rust-deep mb-2">
              Rust variant
            </p>
            <p className="text-sm text-rust-deep">For honesty flags later.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
