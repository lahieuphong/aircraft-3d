"use client";

import { useProgress } from "@react-three/drei";
import { Box, Cpu, Database, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ASSET_PROFILES,
  type AssetProfile,
} from "@/components/viewer/viewer-types";

type LoadingOverlayProps = {
  isLoaded: boolean;
  assetProfile: AssetProfile;
};

function LoadingOverlay({ isLoaded, assetProfile }: LoadingOverlayProps) {
  const { active, progress, loaded, total } = useProgress();
  const safeProgress = Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));

  return (
    <div
      aria-live="polite"
      aria-hidden={isLoaded}
      className={cn(
        "absolute inset-0 z-40 grid place-items-center bg-[#17181c]/94 px-5 backdrop-blur-md transition-all duration-700",
        isLoaded && "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="scan-line" />
      <div className="hud-corners w-full max-w-[440px] px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Box className="size-5" />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[#17181c] bg-primary shadow-[0_0_12px_#f28c28]" />
            </div>
            <div>
              <p className="technical-label text-[9px] text-primary">Digital twin</p>
              <p className="mt-1 text-sm font-medium text-white">
                {ASSET_PROFILES[assetProfile].filename}
              </p>
            </div>
          </div>
          <span className="font-mono text-2xl font-light tabular-nums text-white">
            {Math.round(safeProgress)}<span className="text-sm text-muted-foreground">%</span>
          </span>
        </div>

        <div className="loading-track h-1.5 rounded-full">
          <div
            className="h-full rounded-full bg-primary shadow-[0_0_16px_rgb(242_140_40_/_0.5)] transition-[width] duration-300"
            style={{ width: `${Math.max(active ? 3 : 0, safeProgress)}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <LoadingStep icon={Database} label="Stream" active={safeProgress < 65} done={safeProgress >= 65} />
          <LoadingStep icon={Cpu} label="Decode" active={safeProgress >= 65 && safeProgress < 95} done={safeProgress >= 95} />
          <LoadingStep icon={Sparkles} label="Render" active={safeProgress >= 95} done={isLoaded} />
        </div>

        <p className="mt-7 text-center font-mono text-[10px] tracking-wide text-muted-foreground">
          KTX2 + MESHOPT · GPU READY · {total > 0 ? `${loaded}/${total} tài nguyên` : "đang kết nối GPU"}
        </p>
      </div>
    </div>
  );
}

type LoadingStepProps = {
  icon: typeof Box;
  label: string;
  active: boolean;
  done: boolean;
};

function LoadingStep({ icon: Icon, label, active, done }: LoadingStepProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.025] py-2 text-[10px] tracking-wide text-muted-foreground transition-colors",
        active && "border-primary/20 text-primary",
        done && "text-[#c7d2d4]",
      )}
    >
      <Icon className="size-3" />
      {label}
    </div>
  );
}

export { LoadingOverlay };
