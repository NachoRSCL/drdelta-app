// Gauge circular (270°) cóncavo.
// El surco exterior (track) tiene extremos redondeados.
// Las zonas de color quedan incrustadas dentro del surco (efecto cóncavo).

import { calcRange, toRad, ZONE_COLORS } from "@/lib/gauge";

const CX = 100;
const CY = 84;    // centro del círculo más arriba → deja hueco abajo para el valor
const R = 68;     // radio del surco (centro del trazo)
const SW_T = 22;  // grosor del surco gris exterior
const SW_Z = 14;  // grosor de las zonas de color (más angosto → quedan dentro del surco)
const START = 225; // ángulo del valor mínimo (grados matemáticos, CCW desde derecha)
const SWEEP = 270; // barrido total del gauge (en sentido horario)

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
  const { gMin, gMax } = calcRange(corteRojo, corteVerde, direccion, unidad);
  const span = gMax - gMin || 1;

  // Punto en un círculo a ángulo 'a' (grados matemáticos) y radio 'r'
  const ptAt = (a: number, r: number) => ({
    x: CX + r * Math.cos(toRad(a)),
    y: CY - r * Math.sin(toRad(a)),
  });

  // Valor → ángulo en grados matemáticos (decrece en sentido horario desde START)
  const v2a = (v: number) =>
    START - Math.max(0, Math.min(1, (v - gMin) / span)) * SWEEP;

  // Trazo de arco de a1 a a2 en sentido horario (sweep=1 en SVG)
  const arc = (a1: number, a2: number, r: number): string => {
    const cwSpan = ((a1 - a2) % 360 + 360) % 360;
    const large = cwSpan > 180 ? 1 : 0;
    const p1 = ptAt(a1, r), p2 = ptAt(a2, r);
    const f = (n: number) => n.toFixed(2);
    return `M${f(p1.x)},${f(p1.y)} A${r},${r} 0 ${large},1 ${f(p2.x)},${f(p2.y)}`;
  };

  const endAngle = START - SWEEP; // = -45° ≡ 315° (posición del valor máximo)

  // Con calcRange las zonas siempre tienen igual ancho (90° c/u)
  const cutA1 = v2a(direccion === "normal" ? corteRojo : corteVerde);
  const cutA2 = v2a(direccion === "normal" ? corteVerde : corteRojo);

  const zones =
    direccion === "normal"
      ? [
          [arc(START, cutA1, R), ZONE_COLORS.rojo],
          [arc(cutA1, cutA2, R), ZONE_COLORS.amarillo],
          [arc(cutA2, endAngle, R), ZONE_COLORS.verde],
        ]
      : [
          [arc(START, cutA1, R), ZONE_COLORS.verde],
          [arc(cutA1, cutA2, R), ZONE_COLORS.amarillo],
          [arc(cutA2, endAngle, R), ZONE_COLORS.rojo],
        ];

  const needleA = valor !== null ? v2a(valor) : START - SWEEP / 2;
  const tip = ptAt(needleA, R + SW_Z / 2 - 1); // punta cerca del borde exterior de la zona

  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  const f = (n: number) => n.toFixed(2);

  // Etiquetas de los cortes, afuera del surco
  const cutLabels = [corteRojo, corteVerde].map((v) => {
    const lbl = ptAt(v2a(v), R + SW_T / 2 + 12);
    return { v, x: lbl.x, y: lbl.y };
  });

  // Centro del hueco inferior (apertura de 90° entre los extremos del arco)
  // ptAt(270°) = punto más bajo del círculo = (CX, CY + R)
  const gapCenterY = CY + R; // y ≈ 152 — en el hueco, debajo del arco

  return (
    <svg viewBox="0 0 200 175" width="100%" style={{ maxWidth: 200 }}>
      {/* Surco gris exterior — extremos redondeados, 270° */}
      <path
        d={arc(START, endAngle, R)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={SW_T}
        strokeLinecap="round"
      />

      {/* Zonas de color incrustadas en el surco — extremos planos (butt) */}
      {zones.map(([d, color], i) => (
        <path
          key={i}
          d={d as string}
          fill="none"
          stroke={color as string}
          strokeWidth={SW_Z}
          strokeLinecap="butt"
        />
      ))}

      {/* Etiquetas de corte fuera del surco */}
      {cutLabels.map(({ v, x, y }) => (
        <text
          key={v}
          x={f(x)} y={f(y)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="7.5" fill="#64748b"
        >
          {fmt(v)}{unidad}
        </text>
      ))}

      {/* Aguja */}
      {valor !== null && (
        <>
          <line
            x1={CX} y1={CY} x2={f(tip.x)} y2={f(tip.y)}
            stroke="white" strokeWidth="4" strokeLinecap="round"
          />
          <line
            x1={CX} y1={CY} x2={f(tip.x)} y2={f(tip.y)}
            stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round"
          />
        </>
      )}

      {/* Pivote central */}
      <circle cx={CX} cy={CY} r={8} fill="#1e293b" />
      <circle cx={CX} cy={CY} r={3.5} fill="#f1f5f9" />

      {/* Valor y unidad en el hueco inferior — fuera del círculo */}
      <text
        x={CX} y={gapCenterY + 8}
        textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a"
      >
        {valor !== null ? fmt(valor) : "—"}
      </text>
      {unidad && (
        <text
          x={CX} y={gapCenterY + 24}
          textAnchor="middle" fontSize="10" fill="#64748b"
        >
          {unidad}
        </text>
      )}
    </svg>
  );
}
