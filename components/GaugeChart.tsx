// SVG half-circle gauge. No client state needed — pure rendering.

export default function GaugeChart({
  valor,
  corteRojo,
  corteVerde,
  direccion,
  unidad = "",
}: {
  valor: number | null;
  corteRojo: number;
  corteVerde: number;
  direccion: "normal" | "invertida";
  unidad?: string;
}) {
  const CX = 100;
  const CY = 100;
  const RO = 82; // outer radius
  const RI = 54; // inner radius

  // Gauge range: gMax set so green zone = yellow zone in width
  const gMin = 0;
  const raw =
    direccion === "normal"
      ? corteVerde + (corteVerde - corteRojo)
      : corteRojo + (corteRojo - corteVerde);
  const gMax = raw > gMin ? raw : gMin + 1;

  const toRad = (d: number) => (d * Math.PI) / 180;

  // Angle 0° = right (3 o'clock), increases counterclockwise.
  // SVG coords: x = CX + r·cos(θ), y = CY − r·sin(θ)  [y-axis flipped]
  const pt = (a: number, r: number) => ({
    x: CX + r * Math.cos(toRad(a)),
    y: CY - r * Math.sin(toRad(a)),
  });

  // Value → angle: gMin maps to 180° (left), gMax maps to 0° (right)
  const v2a = (v: number) =>
    180 - Math.max(0, Math.min(1, (v - gMin) / (gMax - gMin))) * 180;

  // Donut arc segment from angle a1 to a2 (a1 > a2, both in [0°,180°]).
  // Outer arc uses sweep=0 (counterclockwise in SVG = going through top).
  // Inner arc uses sweep=1 to close the shape.
  const seg = (a1: number, a2: number, ro: number, ri: number): string => {
    const large = a1 - a2 > 180 ? 1 : 0;
    const o1 = pt(a1, ro), o2 = pt(a2, ro);
    const i2 = pt(a2, ri), i1 = pt(a1, ri);
    const s = (n: number) => n.toFixed(2);
    return (
      `M${s(o1.x)} ${s(o1.y)}` +
      `A${ro} ${ro} 0 ${large} 0 ${s(o2.x)} ${s(o2.y)}` +
      `L${s(i2.x)} ${s(i2.y)}` +
      `A${ri} ${ri} 0 ${large} 1 ${s(i1.x)} ${s(i1.y)}Z`
    );
  };

  const cutA1 = v2a(direccion === "normal" ? corteRojo : corteVerde);
  const cutA2 = v2a(direccion === "normal" ? corteVerde : corteRojo);

  const zones: [number, number, string][] =
    direccion === "normal"
      ? [
          [180, cutA1, "#ef4444"],
          [cutA1, cutA2, "#eab308"],
          [cutA2, 0, "#22c55e"],
        ]
      : [
          [180, cutA1, "#22c55e"],
          [cutA1, cutA2, "#eab308"],
          [cutA2, 0, "#ef4444"],
        ];

  const needleAngle = valor !== null ? v2a(valor) : 90;
  const tip = pt(needleAngle, RO - 6); // needle tip inside the arc
  const s = (n: number) => n.toFixed(2);

  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  const ticks = [
    { v: corteRojo, a: v2a(corteRojo) },
    { v: corteVerde, a: v2a(corteVerde) },
  ];

  return (
    <svg viewBox="0 0 200 116" width="100%" style={{ maxWidth: 200 }}>
      {/* Gray background arc */}
      <path d={seg(180, 0, RO, RI)} fill="#e2e8f0" />

      {/* Colored zones */}
      {zones.map(([a1, a2, fill], i) => (
        <path key={i} d={seg(a1 as number, a2 as number, RO, RI)} fill={fill as string} />
      ))}

      {/* White tick lines + labels at cut values */}
      {ticks.map(({ v, a }) => {
        const inner = pt(a, RI - 1);
        const outer = pt(a, RO + 2);
        const lbl = pt(a, RO + 13);
        return (
          <g key={v}>
            <line
              x1={s(inner.x)} y1={s(inner.y)}
              x2={s(outer.x)} y2={s(outer.y)}
              stroke="white" strokeWidth="2.5"
            />
            <text
              x={s(lbl.x)} y={s(lbl.y)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7.5" fill="#475569"
            >
              {fmt(v)}{unidad}
            </text>
          </g>
        );
      })}

      {/* Needle: white outline + dark core */}
      {valor !== null && (
        <>
          <line
            x1={CX} y1={CY} x2={s(tip.x)} y2={s(tip.y)}
            stroke="white" strokeWidth="4" strokeLinecap="round"
          />
          <line
            x1={CX} y1={CY} x2={s(tip.x)} y2={s(tip.y)}
            stroke="#1e293b" strokeWidth="2" strokeLinecap="round"
          />
        </>
      )}

      {/* Center pivot cap */}
      <circle cx={CX} cy={CY} r={7} fill="#1e293b" />
      <circle cx={CX} cy={CY} r={3} fill="#f1f5f9" />

      {/* Numeric value below pivot */}
      <text
        x={CX} y={CY + 15}
        textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a"
      >
        {valor !== null ? `${fmt(valor)}${unidad ? ` ${unidad}` : ""}` : "—"}
      </text>
    </svg>
  );
}
