import { COLOR_BG, type Color } from "@/lib/semaforo";

export default function SemaforoDot({ color, size = 10 }: { color: Color | null; size?: number }) {
  const cls = color ? COLOR_BG[color] : "bg-slate-300";
  return (
    <span
      aria-label={color ?? "sin valor"}
      className={`inline-block rounded-full ${cls}`}
      style={{ width: size, height: size }}
    />
  );
}
