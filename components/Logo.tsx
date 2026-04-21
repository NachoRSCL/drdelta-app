import Image from "next/image";

/**
 * Logo de Addvise.
 * Usa por defecto /public/addvise-logo.svg (un SVG que aproxima la identidad).
 * Cuando tengamos el PNG/SVG oficial, lo dejas en /public/addvise-logo.png o .svg
 * con el mismo nombre y se reemplaza automáticamente.
 */
export default function Logo({ size = 32, withWord = true }: { size?: number; withWord?: boolean }) {
  // mantenemos la firma `size` y `withWord` por compatibilidad con lo que ya está montado.
  // el SVG incluye el wordmark; `withWord=false` muestra sólo el mark recortando el viewBox con CSS.
  const height = size;
  const width = withWord ? size * 3.25 : size * 0.95;
  return (
    <span
      className="inline-flex items-center"
      style={{
        height,
        width,
        overflow: "hidden",
      }}
    >
      <Image
        src="/addvise-logo.svg"
        alt="AddVise"
        width={520}
        height={160}
        style={{
          height,
          width: withWord ? "auto" : size * 3.25,
          objectFit: "contain",
          objectPosition: "left center",
        }}
        priority
      />
    </span>
  );
}

/** Variante que usa un PNG oficial si lo dejas en /public/addvise-logo.png */
export function LogoPng({ height = 36 }: { height?: number }) {
  return (
    <Image
      src="/addvise-logo.png"
      alt="AddVise"
      height={height}
      width={height * 3}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
