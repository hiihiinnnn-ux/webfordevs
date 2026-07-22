type Props = { content: string };

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function MarkdownLite({ content }: Props) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="prose-lite">
      {blocks.map((block, idx) => {
        if (block.startsWith("```")) {
          const lines = block.split("\n");
          const code = lines.slice(1, lines[lines.length - 1] === "```" ? -1 : undefined).join("\n");
          return (
            <pre key={idx} className="code-block">
              <code>{code.replace(/```$/, "")}</code>
            </pre>
          );
        }
        if (block.startsWith("# ")) {
          return <h1 key={idx}>{block.slice(2)}</h1>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={idx}>{block.slice(3)}</h2>;
        }
        if (block.startsWith("| ")) {
          const rows = block
            .split("\n")
            .filter((r) => r.trim().startsWith("|") && !r.includes("---"));
          return (
            <div key={idx} className="table-wrap">
              <table>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row
                        .split("|")
                        .filter(Boolean)
                        .map((cell, cIdx) =>
                          rIdx === 0 ? (
                            <th key={cIdx}>{cell.trim()}</th>
                          ) : (
                            <td key={cIdx}>{cell.trim()}</td>
                          ),
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={idx}>
              {items.map((item, i) => (
                <li key={i}>{renderInline(item.slice(2))}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(block)) {
          const items = block.split("\n").filter((l) => /^\d+\.\s/.test(l));
          return (
            <ol key={idx}>
              {items.map((item, i) => (
                <li key={i}>{renderInline(item.replace(/^\d+\.\s/, ""))}</li>
              ))}
            </ol>
          );
        }
        return <p key={idx}>{renderInline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
