import type { FC, ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-8 py-16">{children}</main>

      <footer className="max-w-3xl mx-auto px-8 py-8 border-t border-rule-soft">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          Resume Advisor · Odyssey Therapeia · v0.1
        </p>
      </footer>
    </div>
  );
};

export default Layout;
