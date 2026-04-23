export const toRad = (d: number) => (d * Math.PI) / 180;

export function calcRange(
  corteRojo: number,
  corteVerde: number,
  direccion: "normal" | "invertida",
  unidad: string
): { gMin: number; gMax: number } {
  if (unidad.includes("%")) return { gMin: 0, gMax: 100 };
  const gap = Math.abs(corteVerde - corteRojo);
  const safeGap = gap > 0 ? gap : Math.max(corteRojo, corteVerde) * 0.2 || 10;
  if (direccion === "normal") {
    return { gMin: Math.max(0, corteRojo - safeGap), gMax: corteVerde + safeGap };
  }
  return { gMin: Math.max(0, corteVerde - safeGap), gMax: corteRojo + safeGap };
}

export const ZONE_COLORS = {
  rojo: "#ef4444",
  amarillo: "#eab308",
  verde: "#22c55e",
} as const;
