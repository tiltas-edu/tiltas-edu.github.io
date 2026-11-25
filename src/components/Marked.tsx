import { markDifferences } from '../lib/confusable';

// Text with the letters that tell it apart from look-alike words marked (plot<mark>as</mark> / plot<mark>is</mark>).
export default function Marked({ text, like }: { text: string; like?: string[] }) {
  if (!like?.length) return <>{text}</>;
  return (
    <>
      {markDifferences(text, like).map((p, i) => (p.diff ? <mark key={i} className="diff">{p.text}</mark> : p.text))}
    </>
  );
}
