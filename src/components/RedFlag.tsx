import type { FC } from "react";

type RedFlagProps = {
  flag: string;
  index: number;
};

const RedFlag: FC<RedFlagProps> = ({ flag, index }) => {
  return (
    <article className="flex gap-4 py-3">
      <p className="font-mono text-xs uppercase tracking-widest text-rust-deep shrink-0 w-12 mt-1">
        Flag {index + 1}
      </p>
      <p className="text-base text-rust-deep leading-relaxed flex-1">{flag}</p>
    </article>
  );
};

export default RedFlag;
