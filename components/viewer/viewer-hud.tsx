"use client";

import { useState } from "react";
import {
  Box,
  Gauge,
  Grid2X2,
  Info,
  Keyboard,
  Maximize2,
  Minimize2,
  MousePointer2,
  Plane,
  RefreshCw,
  RotateCw,
  Scan,
  Settings2,
  SunMedium,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ASSET_PROFILES,
  MODEL_STATS,
  type AssetProfile,
  type ViewPreset,
  type ViewerSettings,
} from "@/components/viewer/viewer-types";

type ViewerHudProps = {
  settings: ViewerSettings;
  viewPreset: ViewPreset;
  assetProfile: AssetProfile;
  isLoaded: boolean;
  isFullscreen: boolean;
  onSettingsChange: (settings: Partial<ViewerSettings>) => void;
  onViewChange: (view: ViewPreset) => void;
  onReset: () => void;
  onFullscreen: () => void;
};

const VIEW_PRESETS: Array<{ value: ViewPreset; label: string; short: string }> = [
  { value: "iso", label: "Phối cảnh", short: "ISO" },
  { value: "front", label: "Chính diện", short: "FRT" },
  { value: "side", label: "Cạnh bên", short: "SDE" },
  { value: "top", label: "Từ trên", short: "TOP" },
];

function ViewerHud({
  settings,
  viewPreset,
  assetProfile,
  isLoaded,
  isFullscreen,
  onSettingsChange,
  onViewChange,
  onReset,
  onFullscreen,
}: ViewerHudProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="pointer-events-none absolute inset-0 z-20 select-none">
        <header className="pointer-events-auto absolute inset-x-0 top-0 flex h-[68px] items-center justify-between border-b border-white/[0.07] bg-[#17181c]/62 px-3 backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:size-10">
              <Plane className="size-4 -rotate-12 sm:size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-[0.13em] text-white">AEROVIEW</span>
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
                <span className="technical-label hidden text-[8px] text-muted-foreground sm:block">
                  Digital twin 01
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                Interactive aircraft inspection
              </p>
            </div>
          </div>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
            <Badge variant="secondary" className="h-7 bg-black/20 px-3">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isLoaded
                    ? "bg-primary shadow-[0_0_8px_#f28c28]"
                    : "animate-pulse bg-amber-300",
                )}
              />
              {isLoaded ? "Renderer online" : "Loading model"}
            </Badge>
            <Badge variant="outline" className="h-7 px-3">
              {ASSET_PROFILES[assetProfile].label} · MESHOPT
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Thông tin mô hình"
                  data-active={infoOpen}
                  onClick={() => setInfoOpen((value) => !value)}
                  className="lg:hidden"
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thông tin mô hình</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  onClick={onFullscreen}
                >
                  {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <aside
          className={cn(
            "glass-panel pointer-events-auto absolute left-4 top-[84px] w-[278px] rounded-2xl p-5 transition-all duration-300 lg:block",
            infoOpen
              ? "block translate-x-0 opacity-100"
              : "hidden -translate-x-3 opacity-0 lg:translate-x-0 lg:opacity-100",
          )}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-3 top-3 lg:hidden"
            onClick={() => setInfoOpen(false)}
            aria-label="Đóng thông tin"
          >
            <X />
          </Button>
          <div className="flex items-start justify-between pr-7 lg:pr-0">
            <div>
              <p className="technical-label text-[9px] text-primary">Asset overview</p>
              <h1 className="mt-2 text-xl font-medium tracking-[-0.035em] text-white">
                Aircraft 3D
              </h1>
            </div>
            <Box className="mt-0.5 hidden size-5 text-muted-foreground lg:block" />
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Mô hình Blender glTF 2.0, hiển thị với pipeline texture nén cho WebGL.
          </p>

          <div className="my-5 h-px bg-white/[0.07]" />

          <div className="grid grid-cols-3 gap-2">
            <Stat value={MODEL_STATS.triangles} label="Triangles" />
            <Stat value={MODEL_STATS.meshes} label="Meshes" />
            <Stat value={MODEL_STATS.materials} label="Materials" />
          </div>

          <div className="mt-4 rounded-lg border border-white/[0.055] bg-black/15 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-muted-foreground">Kích thước scene</span>
              <span className="font-mono text-[#dce5e6]">{MODEL_STATS.dimensions}</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="technical-label mb-2.5 text-[8px] text-muted-foreground">Camera views</p>
            <div className="grid grid-cols-2 gap-2">
              {VIEW_PRESETS.map((view) => (
                <Button
                  key={view.value}
                  variant="hud"
                  size="sm"
                  data-active={viewPreset === view.value}
                  onClick={() => onViewChange(view.value)}
                  className="justify-between px-3"
                >
                  {view.label}
                  <span className="font-mono text-[8px] opacity-55">{view.short}</span>
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <div className="pointer-events-auto absolute bottom-[74px] left-1/2 flex -translate-x-1/2 items-center rounded-lg border border-white/[0.08] bg-[#0b181c]/85 p-1 shadow-lg backdrop-blur-md md:hidden">
          {VIEW_PRESETS.map((view) => (
            <button
              key={view.value}
              type="button"
              onClick={() => onViewChange(view.value)}
              className={cn(
                "h-7 rounded-md px-3 font-mono text-[9px] tracking-wider text-muted-foreground transition-colors",
                viewPreset === view.value && "bg-primary/12 text-primary",
              )}
            >
              {view.short}
            </button>
          ))}
        </div>

        {settingsOpen ? (
          <section className="glass-panel pointer-events-auto absolute bottom-[76px] right-3 w-[min(340px,calc(100vw-24px))] rounded-2xl p-5 sm:bottom-[86px] sm:right-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="technical-label text-[8px] text-primary">Scene controls</p>
                <h2 className="mt-1 text-sm font-medium text-white">Thiết lập hiển thị</h2>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Đóng thiết lập"
                onClick={() => setSettingsOpen(false)}
              >
                <X />
              </Button>
            </div>

            <div className="mt-5 space-y-5">
              <SettingSlider
                icon={SunMedium}
                label="Exposure"
                valueLabel={settings.exposure.toFixed(2)}
              >
                <Slider
                  min={0.55}
                  max={1.3}
                  step={0.05}
                  value={[settings.exposure]}
                  onValueChange={([value]) => onSettingsChange({ exposure: value })}
                  aria-label="Exposure"
                />
              </SettingSlider>
              <SettingSlider
                icon={Gauge}
                label="Studio light"
                valueLabel={`${Math.round(settings.environmentIntensity * 100)}%`}
              >
                <Slider
                  min={0.35}
                  max={1.4}
                  step={0.05}
                  value={[settings.environmentIntensity]}
                  onValueChange={([value]) =>
                    onSettingsChange({ environmentIntensity: value })
                  }
                  aria-label="Cường độ ánh sáng studio"
                />
              </SettingSlider>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
              <div>
                <p className="text-xs text-[#dfe8e9]">Render quality</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Giới hạn DPR và bóng đổ</p>
              </div>
              <div className="flex rounded-lg border border-white/[0.08] bg-black/15 p-1">
                {(["balanced", "quality"] as const).map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[10px] capitalize text-muted-foreground transition-colors",
                      settings.quality === quality && "bg-white/[0.08] text-white",
                    )}
                    onClick={() => onSettingsChange({ quality })}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="glass-panel pointer-events-auto absolute bottom-3 left-3 right-3 flex h-14 items-center justify-center gap-1.5 rounded-2xl px-2 sm:bottom-5 sm:left-1/2 sm:right-auto sm:h-12 sm:-translate-x-1/2 sm:gap-1 sm:rounded-xl">
          <HudButton
            label="Tự xoay"
            icon={RotateCw}
            active={settings.autoRotate}
            onClick={() => onSettingsChange({ autoRotate: !settings.autoRotate })}
          />
          <HudButton
            label="Lưới"
            icon={Grid2X2}
            active={settings.showGrid}
            onClick={() => onSettingsChange({ showGrid: !settings.showGrid })}
          />
          <HudButton
            label="Wireframe"
            icon={Scan}
            active={settings.wireframe}
            onClick={() => onSettingsChange({ wireframe: !settings.wireframe })}
          />
          <span className="mx-0.5 h-5 w-px bg-white/[0.08]" />
          <HudButton label="Đặt lại" icon={RefreshCw} onClick={onReset} />
          <HudButton
            label="Thiết lập"
            icon={Settings2}
            active={settingsOpen}
            onClick={() => setSettingsOpen((value) => !value)}
          />
        </div>

        <div className="glass-panel pointer-events-none absolute bottom-5 right-5 hidden items-center gap-3 rounded-xl px-3.5 py-2.5 xl:flex">
          <MousePointer2 className="size-4 text-primary" />
          <div className="text-[9px] leading-4 text-muted-foreground">
            <span className="text-[#dbe5e6]">Kéo</span> để xoay · <span className="text-[#dbe5e6]">Cuộn</span> để zoom
          </div>
          <span className="h-5 w-px bg-white/[0.08]" />
          <Keyboard className="size-4 text-muted-foreground" />
          <div className="font-mono text-[8px] text-muted-foreground">R · G · W · SPACE</div>
        </div>
      </div>
    </TooltipProvider>
  );
}

type StatProps = {
  value: string;
  label: string;
};

function Stat({ value, label }: StatProps) {
  return (
    <div className="rounded-lg border border-white/[0.055] bg-white/[0.025] px-2 py-3 text-center">
      <p className="font-mono text-sm font-medium text-white">{value}</p>
      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

type HudButtonProps = {
  label: string;
  icon: typeof Box;
  active?: boolean;
  onClick: () => void;
};

function HudButton({ label, icon: Icon, active = false, onClick }: HudButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-active={active}
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className="size-10 text-muted-foreground hover:text-white data-[active=true]:bg-primary/10 data-[active=true]:text-primary sm:size-9"
        >
          <Icon className={cn(active && "drop-shadow-[0_0_5px_rgb(242_140_40_/_0.48)]")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

type SettingSliderProps = {
  icon: typeof Box;
  label: string;
  valueLabel: string;
  children: React.ReactNode;
};

function SettingSlider({ icon: Icon, label, valueLabel, children }: SettingSliderProps) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#dfe8e9]">
          <Icon className="size-3.5 text-muted-foreground" />
          {label}
        </div>
        <span className="font-mono text-[10px] text-primary">{valueLabel}</span>
      </div>
      {children}
    </div>
  );
}

export { ViewerHud };
