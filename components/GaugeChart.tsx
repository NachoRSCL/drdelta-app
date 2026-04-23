// Zonas sólidas redondeadas + aguja.
// Cada zona es un trazo de arco con strokeLinecap="round":
// los extremos del gauge y las uniones entre zonas quedan redondeados.

import { calcRange, toRad, ZONE_COLORS } from "@/lib/gauge";

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
  const CY = 103; // ligeramente abajo para que las etiquetas superiores tengan espacio
  const R = 68;   // radio del trazo (centro del arco)
  const SW = 28;  // grosor del trazo

  const { gMin, gMax } = calcRange(corteRojo, corteVerde, direccion, unidad);
  const span = gMax - gMin || 1;

  // Punto en el arco de trazo a ángulo 'a' y radio 'r'
  const ptAt = (a: number, r: number) => ({
    x: CX + r * Math.cos(toRad(a)),
    y: CY - r * Math.sin(toRad(a)),
  });

  // Valor → ángulo: 180° = izquierda (gMin), 0° = derecha (gMax)
  const v2a = (v: number) =>
    180 - Math.max(0, Math.min(1, (v - gMin) / span)) * 180;

  // Trazo de arco entre dos ángulos (siempre a1 > a2)
  const arcStroke = (a1: number, a2: number): string => {
    const p1 = ptAt(a1, R), p2 = ptAt(a2, R);
    const large = a1 - a2 > 180 ? 1 : 0;
    const f = (n: number) => n.toFixed(2);
    return `M${f(p1.x)},${f(p1.y)} A${R},${R} 0 ${large},0 ${f(p2.x)},${f(p2.y)}`;
  };

  // Con calcRange las zonas siempre son iguales en ancho (1/3 cada una)
  const cutA1 = v2a(direccion === "normal" ? corteRojo : corteVerde); // ~120°
  const cutA2 = v2a(direccion === "normal" ? corteVerde : corteRojo); // ~60°

  // Orden de dibujo: zona1 → zona2 → zona3
  // Cada zona tapa el extremo redondeado derecho de la anterior → unión limpia
  const zones =
    direccion === "normal"
      ? [
          { d: arcStroke(180, cutA1), color: ZONE_COLORS.rojo },
          { d: arcStroke(cutA1, cutA2), color: ZONE_COLORS.amarillo },
          { d: arcStroke(cutA2, 0), color: ZONE_COLORS.verde },
        ]
      : [
          { d: arcStroke(180, cutA1), color: ZONE_COLORS.verde },
          { d: arcStroke(cutA1, cutA2), color: ZONE_COLORS.amarillo },
          { d: arcStroke(cutA2, 0), color: ZONE_COLORS.rojo },
        ];

  const needleAngle = valor !== null ? v2a(valor) : 90;
  const tip = ptAt(needleAngle, R + SW / 2 - 5); // punta cerca del borde exterior
  const f = (n: number) => n.toFixed(2);
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  // Etiquetas de los cortes, afuera del arco
  const cutLabels = [corteRojo, corteVerde].map((v) => {
    const lbl = ptAt(v2a(v), R + SW / 2 + 12);
    return { v, x: lbl.x, y: lbl.y };
  });

  return (
    <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
      {/* Fondo gris: arco completo con extremos redondeados */}
      <path
        d={arcStroke(180, 0)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={SW}
        strokeLinecap="round"
      />

      {/* Zonas de color (trazo con extremos redondeados) */}
      {zones.map(({ d, color }, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      ))}

      {/* Etiquetas de corte */}
      {cutLabels.map(({ v, x, y }) => (
        <text
          key={v}
          x={f(x)} y={f(y)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7.5"
          fill="#475569"
        >
          {fmt(v)}{unidad}
        </text>
      ))}

      {/* Aguja: trazo blanco grueso + trazo oscuro encima */}
      {valor !== null && (
        <>
          <line
            x1={CX} y1={CY} x2={f(tip.x)} y2={f(tip.y)}
            stroke="white" strokeWidth="5" strokeLinecap="round"
          />
          <line
            x1={CX} y1={CY} x2={f(tip.x)} y2={f(tip.y)}
            stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
          />
        </>
      )}

      {/* Pivote central */}
      <circle cx={CX} cy={CY} r={8} fill="#1e293b" />
      <circle cx={CX} cy={CY} r={3.5} fill="#f1f5f9" />

      {/* Valor numérico debajo del pivote */}
      <text
        x={CX} y={CY + 15}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#0f172a"
      >
        {valor !== null ? `${fmt(valor)}${unidad ? ` ${unidad}` : ""}` : "—"}
      </text>
    </svg>
  );
}
