import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FullRewriteProps = {
  rewrite: string;
};

const FullRewrite: FC<FullRewriteProps> = ({ rewrite }) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="border-t border-rule-soft pt-2"
    >
      <AccordionItem value="rewrite" className="border-none">
        <AccordionTrigger className="font-mono text-xs uppercase tracking-widest text-ink-faint hover:no-underline py-4">
          <span className="text-left">
            Show full rewrite (optional, line edits preferred)
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-base text-ink-muted leading-relaxed whitespace-pre-wrap pb-6">
          {rewrite}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FullRewrite;
