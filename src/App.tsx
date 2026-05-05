import type { FC } from "react";
import Layout from "@/components/Layout";
import ResultsView from "@/components/ResultsView";
import { SAMPLE_ANALYSIS } from "@/lib/fixtures";

const App: FC = () => {
  return (
    <Layout>
      <h1 className="text-6xl font-normal tracking-tight leading-none mb-2">
        Resume <em className="text-rust font-normal">Advisor</em>
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-12">
        Odyssey Therapeia · component preview
      </p>

      <ResultsView results={SAMPLE_ANALYSIS} />
    </Layout>
  );
};

export default App;
