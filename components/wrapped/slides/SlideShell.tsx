import type { ReactNode } from "react";

// Un gradiente distinto por tipo de slide — es parte de lo que hace que
// un "wrapped" se sienta como un evento narrativo y no como una serie de
// tarjetas de dashboard reordenadas. Todos se mantienen dentro de la
// misma familia tonal oscura para no romper la identidad del producto.
const GRADIENTS: Record<string, string> = {
  opening: "from-[#0d1117] via-[#0d1117] to-[#0f2942]",
  volume: "from-[#0d1117] via-[#0c2a4d] to-[#0d1117]",
  rhythm: "from-[#1a1400] via-[#2b1d00] to-[#0d1117]",
  languages: "from-[#1a0d29] via-[#2a0f3d] to-[#0d1117]",
  repos: "from-[#031f12] via-[#04331d] to-[#0d1117]",
  streak: "from-[#241400] via-[#3a1f00] to-[#0d1117]",
  closing: "from-[#0d1117] via-[#161b22] to-[#0d1117]"
};

interface SlideShellProps {
  kind: string;
  children: ReactNode;
}

export function SlideShell({ kind, children }: SlideShellProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-b px-8 text-center ${
        GRADIENTS[kind] ?? GRADIENTS.opening
      }`}
    >
      {children}
    </div>
  );
}
