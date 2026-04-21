import Image from "next/image";

/**
 * Logo de DR Delta.
 * Renderiza /public/drdelta-logo.svg a una altura fija, el ancho se ajusta
 * por aspect ratio (3:2).
 *
 * Props:
 *  - size: altura en px (default 32)
 *  - withWord: se mantiene para compatibilidad; el SVG oficial ya incluye el wordmark.
 */
export default function Logo({ size = 32, withWord = true }: { size?: number; withWord?: boolean }) {
  const intrinsicW = 960;
  const intrinsicH = 640;
  const width = Math.round((intrinsicW / intrinsicH) * size);
  void withWord;

  return (
    <Image
      src="/drdelta-logo.svg"
      alt="DR Delta"
      width={width}
      height={size}
      style={{ height: size, width: "auto" }}
      priority
      unoptimized
    />
  );
}

/** Variante para usar un PNG si lo subes a /public/drdelta-logo.png */
export function LogoPng({ height = 36 }: { height?: number }) {
  return (
    <Image
      src="/drdelta-logo.png"
      alt="DR Delta"
      height={height}
      width={Math.round(height * 1.5)}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
