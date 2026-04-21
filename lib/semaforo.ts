/**
 * Evalúa el color del semáforo para un valor dado, según el modelo:
 *  - direccion 'normal'   : mayor valor = mejor.
 *      valor < corte_rojo   → rojo
 *      valor > corte_verde  → verde
 *      en medio             → amarillo
 *  - direccion 'invertida': menor valor = mejor.
 *      valor > corte_rojo   → rojo
 *      valor < corte_verde  → verde
 *      en medio             → amarillo
 */
export type Color = "rojo" | "amarillo" | "verde";

export function evaluarColor(
  valor: number | null | undefined,
  direccion: "normal" | "invertida",
  corteRojo: number,
  corteVerde: number
): Color | null {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null;
  if (direccion === "normal") {
    if (valor < corteRojo) return "rojo";
    if (valor > corteVerde) return "verde";
    return "amarillo";
  } else {
    if (valor > corteRojo) return "rojo";
    if (valor < corteVerde) return "verde";
    return "amarillo";
  }
}

export const COLOR_BG: Record<Color, string> = {
  rojo: "bg-red-600",
  amarillo: "bg-yellow-500",
  verde: "bg-green-600"
};

export const COLOR_BG_SOFT: Record<Color, string> = {
  rojo: "bg-red-50 border-red-200",
  amarillo: "bg-yellow-50 border-yellow-200",
  verde: "bg-green-50 border-green-200"
};

export const COLOR_LABEL: Record<Color, string> = {
  rojo: "Rojo",
  amarillo: "Amarillo",
  verde: "Verde"
};
