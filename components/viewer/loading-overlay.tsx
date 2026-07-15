"use client";

import { useProgress } from "@react-three/drei";
import { Cpu, Database, Sparkles, type LucideIcon } from "lucide-react";

import { MuseumLogo } from "@/components/brand/museum-logo";
import { cn } from "@/lib/utils";
import type { AssetProfile } from "@/components/viewer/viewer-types";

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
        "absolute inset-0 z-40 grid place-items-center bg-background/94 px-5 backdrop-blur-md transition-all duration-700",
        isLoaded && "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="scan-line" />
      <div className="hud-corners w-full max-w-[440px] px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-8 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <MuseumLogo
                size={52}
                priority
                className="rounded-full border border-primary/15 shadow-md"
              />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-primary shadow-sm" />
            </div>
            <div className="min-w-0">
              <p className="technical-label whitespace-nowrap text-[8px] tracking-[0.07em] text-primary sm:text-[9px] sm:tracking-[0.12em]">
                BẢO TÀNG CHỨNG TÍCH CHIẾN TRANH
              </p>
              <p className="mt-1 whitespace-nowrap text-sm font-medium text-foreground">
                Mô hình máy bay 3D
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
                {assetProfile === "mobile" ? "Mobile" : "PC"}
              </p>
            </div>
          </div>
          <span className="shrink-0 font-sans text-2xl font-light tabular-nums text-foreground">
            {Math.round(safeProgress)}<span className="text-sm text-muted-foreground">%</span>
          </span>
        </div>

        <div className="loading-track h-1.5 rounded-full">
          <div
            className="h-full rounded-full bg-primary shadow-md transition-[width] duration-300"
            style={{ width: `${Math.max(active ? 3 : 0, safeProgress)}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <LoadingStep icon={Database} label="Tải dữ liệu" active={safeProgress < 65} done={safeProgress >= 65} />
          <LoadingStep icon={Cpu} label="Giải mã" active={safeProgress >= 65 && safeProgress < 95} done={safeProgress >= 95} />
          <LoadingStep icon={Sparkles} label="Hiển thị" active={safeProgress >= 95} done={isLoaded} />
        </div>

        <p className="mt-7 text-center font-sans text-[10px] tracking-wide text-muted-foreground">
          Dữ liệu đã tối ưu · {total > 0 ? `${loaded}/${total} tài nguyên` : "đang chuẩn bị hiển thị"}
        </p>
      </div>
    </div>
  );
}

type LoadingStepProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  done: boolean;
};

function LoadingStep({ icon: Icon, label, active, done }: LoadingStepProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md border border-border/70 bg-card/50 py-2 text-[10px] tracking-wide text-muted-foreground transition-colors",
        active && "border-primary/20 text-primary",
        done && "text-foreground/75",
      )}
    >
      <Icon className="size-3" />
      {label}
    </div>
  );
}

export { LoadingOverlay };
