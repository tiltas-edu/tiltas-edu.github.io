import type { ReactElement } from 'react';
import { legend, shown, type Lbl, type Node, type Scheme as S } from '../lib/scheme';

type Lang = 'ru' | 'en';

// One SVG text: the Lithuanian word, then the value or "?".
function T({ l, x, y, solved, anchor = 'middle', two = false }: { l: Lbl; x: number; y: number; solved: boolean; anchor?: 'start' | 'middle'; two?: boolean }) {
  const v = <tspan className={l.find ? 'sc__find' : undefined}>{shown(l, solved)}</tspan>;
  if (two && l.lt) {
    return (
      <text x={x} y={y} textAnchor={anchor} className="sc__t sc__t--small">
        <tspan x={x}>{l.lt}</tspan>
        <tspan x={x} dy="1.2em">{v}</tspan>
      </text>
    );
  }
  return <text x={x} y={y} textAnchor={anchor} className="sc__t">{l.lt ? `${l.lt} ` : ''}{v}</text>;
}

function Shape({ s, solved }: { s: Extract<S, { kind: 'shape' }>; solved: boolean }) {
  const split = s.cols * s.rows > 1;
  const cell = split ? Math.min(84, 252 / s.cols) : 0;
  const W = split ? cell * s.cols : s.square ? 140 : 210;
  const H = split ? cell * s.rows : s.square ? 140 : 120;
  const E = s.ext ? Math.round(W * 0.45) : 0;
  const x0 = 10;
  const y0 = s.around ? 40 : 14;
  let below = y0 + H + 28;
  const lines: ReactElement[] = [];
  if (s.bottom) { lines.push(<T key="b" l={s.bottom} x={x0 + W / 2} y={below} solved={solved} />); }
  if (s.ext) lines.push(<T key="e" l={s.ext} x={x0 + W + E / 2} y={below} solved={solved} />);
  if (s.bottom || s.ext) below += 26;
  if (s.cellSide) { lines.push(<T key="cs" l={s.cellSide} x={x0} y={below} solved={solved} anchor="start" />); below += 26; }
  const insideBelow = s.inside && (s.cell || s.shadeLbl);
  if (insideBelow) { lines.push(<T key="i" l={s.inside!} x={x0} y={below} solved={solved} anchor="start" />); below += 26; }
  const sideW = s.side ? 130 : 10;
  const width = Math.max(x0 + W + E + sideW, 280);
  const height = below - 6;
  const strips = s.shade ? s.shade[1] : 0;

  return (
    <svg className="sc__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      {s.shade && (
        <>
          <rect x={x0} y={y0} width={(W * s.shade[0]) / strips} height={H} className="sc__shade" />
          {Array.from({ length: strips - 1 }, (_, i) => (
            <line key={i} x1={x0 + (W * (i + 1)) / strips} x2={x0 + (W * (i + 1)) / strips} y1={y0} y2={y0 + H} className="sc__dash" />
          ))}
        </>
      )}
      {split && Array.from({ length: s.cols - 1 }, (_, i) => (
        <line key={`c${i}`} x1={x0 + cell * (i + 1)} x2={x0 + cell * (i + 1)} y1={y0} y2={y0 + H} className="sc__line" />
      ))}
      {split && Array.from({ length: s.rows - 1 }, (_, i) => (
        <line key={`r${i}`} x1={x0} x2={x0 + W} y1={y0 + cell * (i + 1)} y2={y0 + cell * (i + 1)} className="sc__line" />
      ))}
      {s.cell && <rect x={x0} y={y0} width={cell} height={cell} className="sc__shade" />}
      {s.ext && <rect x={x0 + W} y={y0} width={E} height={H} className="sc__ext" />}
      <rect x={x0} y={y0} width={W} height={H} className={s.around ? 'sc__edge sc__edge--bold' : 'sc__edge'} />
      {s.around && <T l={s.around} x={x0 + W / 2} y={y0 - 14} solved={solved} />}
      {s.side && <T l={s.side} x={x0 + W + E + 8} y={y0 + H / 2 + 6} solved={solved} anchor="start" />}
      {s.inside && !insideBelow && <T l={s.inside} x={x0 + (W + E) / 2} y={y0 + H / 2 - 4} solved={solved} two />}
      {s.cell && <T l={s.cell} x={x0 + cell / 2} y={y0 + cell / 2 - 6} solved={solved} two />}
      {s.shade && s.shadeLbl && <T l={s.shadeLbl} x={x0 + (W * s.shade[0]) / strips / 2} y={y0 + H / 2 - 6} solved={solved} two />}
      {lines}
    </svg>
  );
}

function Bar({ s, solved }: { s: Extract<S, { kind: 'bar' }>; solved: boolean }) {
  const W = 300;
  const x0 = 10;
  const sum = s.parts.reduce((a, p) => a + p.w, 0);
  let x = x0;
  const parts = s.parts.map((p, i) => {
    const w = (W * p.w) / sum;
    const el = (
      <g key={i}>
        <rect x={x} y={34} width={w} height={40} className={p.mark ? 'sc__shade sc__edge' : 'sc__edge'} />
        {p.lbl && <T l={p.lbl} x={x + w / 2} y={100} solved={solved} two />}
      </g>
    );
    x += w;
    return el;
  });
  return (
    <svg className="sc__svg" viewBox={`0 0 ${W + 2 * x0} 140`} role="img" aria-hidden="true">
      <path d={`M${x0} 28 V20 H${x0 + W} V28`} className="sc__brace" />
      <T l={s.total} x={x0 + W / 2} y={15} solved={solved} />
      {parts}
    </svg>
  );
}

// Outline, so it fits a phone: the box, then what it is made of, joined by the sign.
function TreeNode({ n, solved }: { n: Node; solved: boolean }) {
  return (
    <div className="sc-node">
      <div className={`sc-box${n.lbl.find ? ' sc-box--find' : ''}`}>
        {n.lbl.lt && <span lang="lt">{n.lbl.lt}</span>}{' '}
        <strong className={n.lbl.find ? 'sc__find' : undefined}>{shown(n.lbl, solved)}</strong>
        {n.kids && <span className="sc-eq" aria-hidden="true"> =</span>}
      </div>
      {n.kids && (
        <ul className="sc-kids">
          {n.kids.map((k, i) => (
            <li key={i}><span className="sc-op" aria-hidden="true">{i > 0 ? n.op : ''}</span><TreeNode n={k} solved={solved} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Scheme({ scheme, lang, solved = false }: { scheme: S; lang: Lang; solved?: boolean }) {
  const words = legend(scheme, lang);
  return (
    <figure className="sc">
      {scheme.kind === 'shape' && <Shape s={scheme} solved={solved} />}
      {scheme.kind === 'bar' && <Bar s={scheme} solved={solved} />}
      {scheme.kind === 'tree' && <div className="sc-tree"><TreeNode n={scheme.root} solved={solved} /></div>}
      {words.length > 0 && (
        <figcaption className="native sc__legend">
          {words.map((w, i) => <span key={w.lt}>{i > 0 && ' · '}<span lang="lt">{w.lt}</span> — {w.tr}</span>)}
        </figcaption>
      )}
    </figure>
  );
}
