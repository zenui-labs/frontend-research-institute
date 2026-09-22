import type { ContentBlock } from "@/content/types";
import { Callout } from "./ui/callout";
import { CodeBlock } from "./ui/code-block";
import { DataTable } from "./ui/data-table";
import { ReferenceList } from "./ui/reference-list";
import { RichText } from "./ui/rich-text";
import { SimMount } from "./sims/sim-mount";
import { WhyMachine } from "./why/why-machine";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "prose":
      return (
        <p className="text-steel text-[1.0625rem] leading-[1.7]">
          <RichText text={block.text} />
        </p>
      );
    case "code":
      return (
        <CodeBlock
          code={block.code}
          lang={block.lang}
          caption={block.caption}
          filename={block.filename}
          highlight={block.highlight}
        />
      );
    case "callout":
      return <Callout variant={block.variant} title={block.title} text={block.text} />;
    case "sim":
      return <SimMount sim={block.sim} caption={block.caption} />;
    case "table":
      return <DataTable head={block.head} rows={block.rows} caption={block.caption} />;
    case "why":
      return <WhyMachine question={block.question} chain={block.chain} />;
    case "refs":
      return <ReferenceList items={block.items} />;
    case "steps":
      return (
        <div className="py-1">
          {block.title ? (
            <p className="text-2xs text-steel-dim mb-4 font-medium tracking-[0.14em] uppercase">
              {block.title}
            </p>
          ) : null}
          <ol className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-2xs text-crt mt-1 shrink-0 font-mono tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-steel text-base leading-relaxed">
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );
  }
}
