"use client";

import { ClientOnly } from "@/components/client-only";
import { ShaderBackground } from "@/components/motion/shader-background";
import { useReducedMotion } from "motion/react";

export function Ambient() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070605]">
      <ClientOnly>
        <div className="absolute inset-0 opacity-[0.55]">
          <ShaderBackground
            variant="grain-gradient"
            colors={["#3a2414", "#c45a2a", "#1a3a32", "#0a0a0c"]}
            colorBack="#070605"
            softness={0.82}
            speed={reduce ? 0 : 0.18}
            shape="corners"
          />
        </div>
      </ClientOnly>
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent,rgba(7,6,5,0.55)_55%,#070605_100%)]" />
      <div className="noise-layer" />
    </div>
  );
}
