import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++}>
          <code className={lang ? `language-${lang}` : ""}>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={key++}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={key++}>{line.slice(3)}</h2>);
    } else if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .filter((r) => !r.includes("---"))
        .map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));
      if (rows.length > 0) {
        const [header, ...body] = rows;
        elements.push(
          <table key={key++}>
            <thead>
              <tr>
                {header.map((h, idx) => (
                  <th key={idx}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ridx) => (
                <tr key={ridx}>
                  {row.map((cell, cidx) => (
                    <td key={cidx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      continue;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={key++}><strong>{line.slice(2, -2)}</strong></p>);
    } else {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(<p key={key++} dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
    i++;
  }

  return elements;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  let guide;
  try {
    guide = await api.guide(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="container guide-content">
      <Link href="/guides" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
        ← All guides
      </Link>
      <h1 style={{ marginTop: "1rem" }}>{guide.title}</h1>
      <div className="guide-meta">
        <span>{guide.level}</span>
        <span>{guide.reading_time_minutes} min read</span>
      </div>
      <div className="guide-body">{renderMarkdown(guide.content)}</div>
    </div>
  );
}
