import { tokens, values } from '@creance-ui/tokens';

type Tree = { [key: string]: string | number | Tree };

/** Flattens a token tree into [dotted.name, cssVar, lightValue] rows. */
function flatten(refs: Tree, raw: Tree, prefix = ''): Array<[string, string, string]> {
  return Object.entries(refs).flatMap(([key, ref]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    const value = raw[key];
    return typeof ref === 'object'
      ? flatten(ref, value as Tree, name)
      : [[name, String(ref), String(value)] as [string, string, string]];
  });
}

const palettes = ['gray', 'blue', 'red'] as const;

function Swatches({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <div className="tk-grid">
      {rows.map(([name, ref, value]) => (
        <div className="tk-swatch" key={name}>
          <div className="tk-swatch__chip" style={{ background: ref }} />
          <div className="tk-swatch__label">
            <div className="tk-name">{name}</div>
            <div className="tk-value">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Semantic colours. Swatches use var() references, so they follow the theme toolbar. */
export function SemanticColors() {
  return <Swatches rows={flatten(tokens.color, values.color, 'color')} />;
}

export function PrimitiveColors() {
  return (
    <>
      {palettes.map((p) => (
        <Swatches key={p} rows={flatten(tokens[p], values[p], p)} />
      ))}
    </>
  );
}

export function Spacing() {
  return (
    <div className="tk-rows">
      {flatten(tokens.space, values.space, 'space').map(([name, ref, value]) => (
        <div className="tk-row" key={name}>
          <span className="tk-name">
            {name} <span className="tk-value">{value}</span>
          </span>
          <div className="tk-bar" style={{ width: ref }} />
        </div>
      ))}
    </div>
  );
}

export function Radius() {
  return (
    <div className="tk-grid">
      {flatten(tokens.radius, values.radius, 'radius').map(([name, ref, value]) => (
        <div key={name}>
          <div className="tk-box" style={{ borderRadius: ref }} />
          <div className="tk-name">{name}</div>
          <div className="tk-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

export function Typography() {
  const sizes = flatten(tokens.font.size, values.font.size, 'font.size');
  const weights = flatten(tokens.font.weight, values.font.weight, 'font.weight');
  return (
    <div className="tk-rows">
      {sizes.map(([name, ref, value]) => (
        <div className="tk-row" key={name}>
          <span className="tk-name">
            {name} <span className="tk-value">{value}</span>
          </span>
          <span style={{ fontSize: ref }}>Agent wants to run npm install</span>
        </div>
      ))}
      {weights.map(([name, ref, value]) => (
        <div className="tk-row" key={name}>
          <span className="tk-name">
            {name} <span className="tk-value">{value}</span>
          </span>
          <span style={{ fontWeight: ref }}>Approve, deny or review</span>
        </div>
      ))}
      <div className="tk-row">
        <span className="tk-name">font.family.mono</span>
        <code style={{ fontFamily: tokens.font.family.mono }}>tool.call.started</code>
      </div>
    </div>
  );
}
