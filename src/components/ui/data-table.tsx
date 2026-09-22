import { RichText } from "./rich-text";

export function DataTable({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: string[][];
  caption?: string;
}) {
  return (
    <figure className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-line border-b">
              {head.map((cell) => (
                <th
                  key={cell}
                  scope="col"
                  className="text-2xs text-steel-dim px-3 py-2.5 font-medium tracking-[0.08em] uppercase"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-ink-800">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={
                      j === 0
                        ? "text-bone px-3 py-2.5 align-top font-mono text-xs font-medium"
                        : "text-steel px-3 py-2.5 align-top text-sm"
                    }
                  >
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="border-line text-steel-dim border-t px-3 py-2.5 text-xs">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
