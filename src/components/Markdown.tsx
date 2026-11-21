import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renderizador mínimo de Markdown para los textos legales aprobados.
 * Admite encabezados (#, ##, ###), párrafos, listas, **negritas** y enlaces.
 * No interpreta HTML, por lo que el contenido no puede inyectar código.
 */
export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        const first = lines[0] ?? "";
        const heading = first.match(/^(#{1,3})\s+(.*)$/);
        if (heading && lines.length === 1) {
          const level = heading[1].length;
          const content = inline(heading[2]);
          return level === 3 ? <h3 key={i}>{content}</h3> : <h2 key={i}>{content}</h2>;
        }
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </>
  );
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      out.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      const href = match[3];
      if (href.startsWith("/")) out.push(<Link key={key++} href={href}>{match[2]}</Link>);
      else if (/^(https?:|mailto:|tel:)/.test(href)) out.push(<a key={key++} href={href}>{match[2]}</a>);
      else out.push(match[2]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
