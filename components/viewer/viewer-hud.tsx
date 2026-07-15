"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Gauge,
  Grid2X2,
  Info,
  Keyboard,
  Maximize2,
  Minimize2,
  MousePointer2,
  RefreshCw,
  RotateCw,
  Scan,
  Settings2,
  SunMedium,
  X,
} from "lucide-react";

import { MuseumLogo } from "@/components/brand/museum-logo";
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
  isFullscreen: boolean;
  onSettingsChange: (settings: Partial<ViewerSettings>) => void;
  onViewChange: (view: ViewPreset) => void;
  onReset: () => void;
  onFullscreen: () => void;
};

const VIEW_PRESETS: Array<{ value: ViewPreset; label: string; short: string }> = [
  { value: "iso", label: "Phối cảnh", short: "Phối" },
  { value: "front", label: "Chính diện", short: "Trước" },
  { value: "side", label: "Cạnh bên", short: "Bên" },
  { value: "top", label: "Từ trên", short: "Trên" },
];

type KeyboardShortcut = {
  keys: string;
  label: string;
  description?: string;
  wide?: boolean;
};

const KEYBOARD_SHORTCUTS: ReadonlyArray<KeyboardShortcut> = [
  { keys: "Cách", label: "Tự xoay" },
  { keys: "D", label: "Đặt lại" },
  { keys: "L", label: "Lưới nền" },
  { keys: "K", label: "Khung vật thể" },
  {
    keys: "1–4",
    label: "Chọn góc nhìn",
    description: "1 Phối cảnh · 2 Trước · 3 Bên · 4 Trên",
    wide: true,
  },
];

const QUALITY_OPTIONS = [
  { value: "balanced", label: "Cân bằng" },
  { value: "quality", label: "Chất lượng cao" },
] as const;

const POINTER_CONTROLS = [
  { action: "Xoay", gesture: "Kéo trái / nút giữa" },
  { action: "Di chuyển", gesture: "Kéo phải" },
  { action: "Thu phóng", gesture: "Cuộn" },
] as const;

type ReferenceMode = "model" | "shortcuts";

function ViewerHud({
  settings,
  viewPreset,
  assetProfile,
  isFullscreen,
  onSettingsChange,
  onViewChange,
  onReset,
  onFullscreen,
}: ViewerHudProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode | null>(null);
  const infoTriggerRef = useRef<HTMLButtonElement>(null);
  const shortcutTriggerRef = useRef<HTMLButtonElement>(null);
  const referencePanelRef = useRef<HTMLElement>(null);
  const lastReferenceTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!referenceMode) return;

    const focusFrame = window.requestAnimationFrame(() => {
      referencePanelRef.current?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setReferenceMode(null);
      lastReferenceTriggerRef.current?.focus({ preventScroll: true });
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        referencePanelRef.current?.contains(target) ||
        infoTriggerRef.current?.contains(target) ||
        shortcutTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setReferenceMode(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [referenceMode]);

  const toggleReference = (
    mode: ReferenceMode,
    trigger: HTMLButtonElement | null,
  ) => {
    lastReferenceTriggerRef.current = trigger;
    setReferenceMode((current) => (current === mode ? null : mode));
    setSettingsOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen((value) => !value);
    setReferenceMode(null);
  };

  const closeReference = () => {
    setReferenceMode(null);
    lastReferenceTriggerRef.current?.focus({ preventScroll: true });
  };

  const handleFullscreen = () => {
    setReferenceMode(null);
    onFullscreen();
  };

  return (
    <TooltipProvider>
      <div className="pointer-events-none absolute inset-0 z-20 select-none">
        <header
          className={cn(
            "pointer-events-auto absolute inset-x-0 top-0 flex h-[68px] items-center justify-between border-b border-[#d3cfc2]/25 px-3 text-[#f5f1e7] shadow-[0_10px_35px_rgb(10_75_127_/_0.18)] backdrop-blur-md transition-colors duration-300 sm:px-5",
            isFullscreen
              ? "bg-[rgb(10_75_127_/_0.88)]"
              : "bg-[#0a4b7f]/94",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <MuseumLogo
              size={48}
              priority
              className="size-10 shrink-0 drop-shadow-[0_4px_12px_rgb(4_35_58_/_0.28)] sm:size-11"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[10px] font-semibold leading-[1.3] tracking-[0.09em] text-[#f5f1e7] sm:text-xs">
                  <span className="sm:hidden">BẢO TÀNG</span>
                  <span className="hidden sm:inline">
                    BẢO TÀNG CHỨNG TÍCH CHIẾN TRANH
                  </span>
                </span>
              </div>
              <p className="max-w-[170px] text-[10px] font-semibold leading-[1.3] tracking-[0.09em] text-[#f5f1e7] sm:mt-0.5 sm:max-w-none sm:text-[10px] sm:font-normal sm:leading-normal sm:tracking-normal sm:text-[#d3cfc2]/80">
                <span className="sm:hidden">
                  <span className="block">CHỨNG TÍCH</span>
                  <span className="block">CHIẾN TRANH</span>
                </span>
                <span className="hidden sm:inline">
                  Mô hình máy bay 3D
                </span>
              </p>
            </div>
          </div>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
            <Badge
              variant="outline"
              className="h-7 border-[#d3cfc2]/20 px-3 text-[#d3cfc2]/75"
            >
              {ASSET_PROFILES[assetProfile].badgeLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={infoTriggerRef}
                  variant="ghost"
                  size="icon"
                  aria-label="Thông tin mô hình"
                  aria-controls="viewer-reference-panel"
                  aria-expanded={referenceMode === "model"}
                  aria-haspopup="dialog"
                  data-active={referenceMode === "model"}
                  onClick={() => toggleReference("model", infoTriggerRef.current)}
                  className="text-[#d3cfc2]/80 hover:bg-[#d3cfc2]/12 hover:text-[#f5f1e7] data-[active=true]:bg-[#d3cfc2]/14 data-[active=true]:text-[#f5f1e7]"
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thông tin mô hình</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={shortcutTriggerRef}
                  variant="ghost"
                  size="icon"
                  aria-label="Phím tắt điều khiển"
                  aria-controls="viewer-reference-panel"
                  aria-expanded={referenceMode === "shortcuts"}
                  aria-haspopup="dialog"
                  data-active={referenceMode === "shortcuts"}
                  onClick={() =>
                    toggleReference("shortcuts", shortcutTriggerRef.current)
                  }
                  className="text-[#d3cfc2]/80 hover:bg-[#d3cfc2]/12 hover:text-[#f5f1e7] data-[active=true]:bg-[#d3cfc2]/14 data-[active=true]:text-[#f5f1e7]"
                >
                  <Keyboard />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Phím tắt điều khiển</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  onClick={handleFullscreen}
                  className="text-[#d3cfc2]/80 hover:bg-[#d3cfc2]/12 hover:text-[#f5f1e7]"
                >
                  {isFullscreen ? <Minimize2 /> : <Maximize2 />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {referenceMode ? (
          <section
            ref={referencePanelRef}
            id="viewer-reference-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="viewer-reference-title"
            tabIndex={-1}
            className="glass-panel pointer-events-auto absolute right-3 top-[76px] z-30 max-h-[calc(100dvh-164px)] w-[min(340px,calc(100vw-24px))] overflow-y-auto rounded-2xl p-4 outline-none sm:right-5 sm:top-[84px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/[0.07] text-primary">
                  {referenceMode === "model" ? (
                    <Box className="size-4" />
                  ) : (
                    <Keyboard className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2
                    id="viewer-reference-title"
                    className="text-sm font-medium text-foreground"
                  >
                    {referenceMode === "model"
                      ? "Máy bay 3D"
                      : "Phím tắt"}
                  </h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Đóng bảng tham chiếu"
                onClick={closeReference}
              >
                <X />
              </Button>
            </div>

            <div
              role="group"
              className="mt-3 grid grid-cols-2 rounded-lg border border-primary/12 bg-primary/[0.035] p-1"
              aria-label="Chọn nội dung tham chiếu"
            >
              <button
                type="button"
                aria-pressed={referenceMode === "model"}
                onClick={() => setReferenceMode("model")}
                className={cn(
                  "flex h-8 items-center justify-center gap-2 rounded-md text-[10px] font-medium text-muted-foreground transition-colors",
                  referenceMode === "model" && "bg-card text-primary shadow-sm",
                )}
              >
                <Box className="size-3.5" />
                Mô hình
              </button>
              <button
                type="button"
                aria-pressed={referenceMode === "shortcuts"}
                onClick={() => setReferenceMode("shortcuts")}
                className={cn(
                  "flex h-8 items-center justify-center gap-2 rounded-md text-[10px] font-medium text-muted-foreground transition-colors",
                  referenceMode === "shortcuts" && "bg-card text-primary shadow-sm",
                )}
              >
                <Keyboard className="size-3.5" />
                Phím tắt
              </button>
            </div>

            {referenceMode === "model" ? (
              <ModelOverview
                viewPreset={viewPreset}
                onViewChange={onViewChange}
              />
            ) : (
              <ShortcutOverview />
            )}
          </section>
        ) : null}

        {!referenceMode && !settingsOpen ? (
          <div className="glass-panel pointer-events-auto absolute bottom-[74px] left-1/2 flex -translate-x-1/2 items-center rounded-lg p-1 md:hidden">
            {VIEW_PRESETS.map((view) => (
              <button
                key={view.value}
                type="button"
                onClick={() => onViewChange(view.value)}
                className={cn(
                  "h-7 rounded-md px-3 font-sans text-[9px] tracking-wider text-muted-foreground transition-colors",
                  viewPreset === view.value && "bg-primary/12 text-primary",
                )}
              >
                {view.short}
              </button>
            ))}
          </div>
        ) : null}

        {settingsOpen ? (
          <section className="glass-panel pointer-events-auto absolute bottom-[76px] left-1/2 z-30 w-[min(340px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl p-5 sm:bottom-[86px]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Thiết lập hiển thị</h2>
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
                label="Độ sáng"
                valueLabel={settings.exposure.toFixed(2).replace(".", ",")}
              >
                <Slider
                  min={0.55}
                  max={1.3}
                  step={0.05}
                  value={[settings.exposure]}
                  onValueChange={([value]) => onSettingsChange({ exposure: value })}
                  aria-label="Độ sáng"
                />
              </SettingSlider>
              <SettingSlider
                icon={Gauge}
                label="Ánh sáng"
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
                  aria-label="Cường độ ánh sáng"
                />
              </SettingSlider>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-primary/12 pt-4">
              <div>
                <p className="text-xs text-foreground">Chất lượng hình ảnh</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Độ nét và bóng đổ</p>
              </div>
              <div
                role="group"
                aria-label="Chọn chất lượng hình ảnh"
                className="flex rounded-lg border border-primary/12 bg-primary/[0.045] p-1"
              >
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={settings.quality === option.value}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors",
                      settings.quality === option.value && "bg-primary/12 text-primary",
                    )}
                    onClick={() => onSettingsChange({ quality: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="glass-panel pointer-events-auto absolute bottom-3 left-1/2 flex h-14 w-[min(340px,calc(100vw-24px))] -translate-x-1/2 items-center justify-center gap-1.5 rounded-2xl px-2 sm:bottom-5 sm:h-12 sm:gap-1 sm:rounded-xl">
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
            label="Khung vật thể"
            icon={Scan}
            active={settings.wireframe}
            onClick={() => onSettingsChange({ wireframe: !settings.wireframe })}
          />
          <span className="mx-0.5 h-5 w-px bg-primary/12" />
          <HudButton label="Đặt lại" icon={RefreshCw} onClick={onReset} />
          <HudButton
            label="Thiết lập"
            icon={Settings2}
            active={settingsOpen}
            onClick={toggleSettings}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

type ModelOverviewProps = {
  viewPreset: ViewPreset;
  onViewChange: (view: ViewPreset) => void;
};

function ModelOverview({ viewPreset, onViewChange }: ModelOverviewProps) {
  return (
    <div className="mt-3">
      <div className="overflow-hidden rounded-lg border border-primary/12 bg-primary/[0.035]">
        <div className="grid grid-cols-3 divide-x divide-primary/10">
          <Stat value={MODEL_STATS.triangles} label="Tam giác" />
          <Stat value={MODEL_STATS.meshes} label="Lưới 3D" />
          <Stat value={MODEL_STATS.materials} label="Vật liệu" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-primary/10 px-3 py-2.5 text-[10px]">
          <span className="text-muted-foreground">Kích thước</span>
          <span className="font-sans text-right text-foreground">
            {MODEL_STATS.dimensions}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <p className="technical-label mb-2.5 text-[8px] text-muted-foreground">
          Góc nhìn
        </p>
        <div className="grid grid-cols-2 gap-2">
          {VIEW_PRESETS.map((view) => (
            <Button
              key={view.value}
              variant="hud"
              size="sm"
              data-active={viewPreset === view.value}
              onClick={() => onViewChange(view.value)}
              className="px-3"
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutOverview() {
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-primary/12 bg-primary/12">
        {KEYBOARD_SHORTCUTS.map((shortcut) => (
          <ShortcutItem key={shortcut.keys} shortcut={shortcut} />
        ))}
      </div>

      <div className="mt-3 border-t border-primary/12 pt-3">
        <div className="mb-2 flex items-center gap-2">
          <MousePointer2 className="size-3.5 text-primary" />
          <p className="technical-label text-[8px] text-muted-foreground">
            Chuột
          </p>
        </div>
        <div className="divide-y divide-primary/10 rounded-lg border border-primary/12 bg-primary/[0.035] px-3">
          {POINTER_CONTROLS.map((control) => (
            <div
              key={control.action}
              className="flex items-center justify-between gap-4 py-1.5 text-[10px]"
            >
              <span className="text-muted-foreground">{control.action}</span>
              <span className="text-right text-foreground">{control.gesture}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ShortcutItem({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-2.5 bg-card/45 px-3 py-2",
        shortcut.wide && "col-span-2",
      )}
    >
      <kbd className="grid h-6 min-w-7 shrink-0 place-items-center rounded-md border border-primary/20 bg-card px-1.5 text-[9px] font-semibold text-primary shadow-[inset_0_-1px_0_rgb(10_75_127_/_0.14)]">
        {shortcut.keys}
      </kbd>
      <div className="min-w-0">
        <p className="text-[10px] text-foreground">{shortcut.label}</p>
        {"description" in shortcut ? (
          <p className="mt-0.5 text-[8px] text-muted-foreground">
            {shortcut.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type StatProps = {
  value: string;
  label: string;
};

function Stat({ value, label }: StatProps) {
  return (
    <div className="px-1 py-2.5 text-center">
      <p className="font-sans text-[13px] font-medium text-foreground">{value}</p>
      <p className="mt-0.5 text-[8px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
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
          className="size-10 text-muted-foreground hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary sm:size-9"
        >
          <Icon className={cn(active && "drop-shadow-[0_0_5px_rgb(10_75_127_/_0.42)]")} />
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
        <div className="flex items-center gap-2 text-xs text-foreground">
          <Icon className="size-3.5 text-muted-foreground" />
          {label}
        </div>
        <span className="font-sans text-[10px] text-primary">{valueLabel}</span>
      </div>
      {children}
    </div>
  );
}

export { ViewerHud };
