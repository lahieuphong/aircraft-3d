"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AircraftScene } from "@/components/viewer/aircraft-scene";
import { LoadingOverlay } from "@/components/viewer/loading-overlay";
import {
  ViewerErrorBoundary,
  WebGLFallback,
} from "@/components/viewer/viewer-error-boundary";
import { ViewerHud } from "@/components/viewer/viewer-hud";
import {
  ASSET_PROFILES,
  type AssetProfile,
  type ViewPreset,
  type ViewerSettings,
} from "@/components/viewer/viewer-types";

const DEFAULT_SETTINGS: ViewerSettings = {
  autoRotate: false,
  showGrid: true,
  wireframe: false,
  exposure: 0.9,
  environmentIntensity: 1,
  quality: "balanced",
};

const MODEL_VERSION = "20260715-dual-v2";

function AircraftViewer() {
  return (
    <ViewerErrorBoundary>
      <AircraftViewerContent />
    </ViewerErrorBoundary>
  );
}

function AircraftViewerContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [assetProfile, setAssetProfile] = useState<AssetProfile | null>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [viewPreset, setViewPreset] = useState<ViewPreset>("iso");
  const [viewRevision, setViewRevision] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const navigatorWithHints = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; saveData?: boolean };
      userAgentData?: { mobile?: boolean };
    };
    const reducedMemory =
      typeof navigatorWithHints.deviceMemory === "number" &&
      navigatorWithHints.deviceMemory <= 6;
    const compactViewport = window.matchMedia("(max-width: 820px)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const mobileBrowser =
      navigatorWithHints.userAgentData?.mobile === true ||
      /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent,
      );
    const constrainedNetwork =
      navigatorWithHints.connection?.saveData === true ||
      ["slow-2g", "2g", "3g"].includes(
        navigatorWithHints.connection?.effectiveType ?? "",
      );

    // The profile depends on browser-only hardware hints and is resolved once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAssetProfile(
      mobileBrowser ||
        reducedMemory ||
        compactViewport ||
        coarsePointer ||
        constrainedNetwork
        ? "mobile"
        : "pc",
    );
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const modelUrl = useMemo(
    () =>
      assetProfile
        ? `/models/${ASSET_PROFILES[assetProfile].filename}?v=${MODEL_VERSION}`
        : null,
    [assetProfile],
  );

  const updateSettings = useCallback((next: Partial<ViewerSettings>) => {
    setSettings((current) => ({ ...current, ...next }));
  }, []);

  const changeView = useCallback((view: ViewPreset) => {
    setViewPreset(view);
    setViewRevision((revision) => revision + 1);
    setSettings((current) => ({ ...current, autoRotate: false }));
  }, []);

  const resetView = useCallback(() => {
    setViewPreset("iso");
    setViewRevision((revision) => revision + 1);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch (error) {
      console.warn("Không thể mở chế độ toàn màn hình", error);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "BUTTON"
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setSettings((current) => ({
          ...current,
          autoRotate: !current.autoRotate,
        }));
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "d") resetView();
      if (key === "l") {
        setSettings((current) => ({
          ...current,
          showGrid: !current.showGrid,
        }));
      }
      if (key === "k") {
        setSettings((current) => ({
          ...current,
          wireframe: !current.wireframe,
        }));
      }
      if (key === "1") changeView("iso");
      if (key === "2") changeView("front");
      if (key === "3") changeView("side");
      if (key === "4") changeView("top");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeView, resetView]);

  const handleModelReady = useCallback(() => setIsLoaded(true), []);
  const handleContextLost = useCallback((lost: boolean) => setContextLost(lost), []);

  return (
    <div
      ref={rootRef}
      className="viewer-shell relative size-full overflow-hidden"
      data-ready={isLoaded}
      data-asset-profile={assetProfile ?? "detecting"}
    >
      <div
        className="absolute inset-0 z-0"
        aria-label="Khung hiển thị mô hình máy bay 3D"
      >
        {modelUrl ? (
          <Canvas
            dpr={
              assetProfile === "mobile"
                ? settings.quality === "quality"
                  ? [1, 1.35]
                  : [1, 1.15]
                : settings.quality === "quality"
                  ? [1, 1.65]
                  : [1, 1.35]
            }
            frameloop={settings.autoRotate ? "always" : "demand"}
            camera={{
              position: [18.5, 12, 20.5],
              fov: 40,
              near: 0.02,
              far: 160,
            }}
            gl={{
              antialias: true,
              alpha: true,
              depth: true,
              stencil: false,
              powerPreference: "high-performance",
            }}
            fallback={<WebGLFallback />}
          >
            <AircraftScene
              modelUrl={modelUrl}
              autoRotate={settings.autoRotate}
              showGrid={settings.showGrid}
              wireframe={settings.wireframe}
              exposure={settings.exposure}
              environmentIntensity={settings.environmentIntensity}
              quality={settings.quality}
              mobileOptimized={assetProfile === "mobile"}
              viewPreset={viewPreset}
              viewRevision={viewRevision}
              onModelReady={handleModelReady}
              onContextLost={handleContextLost}
            />
          </Canvas>
        ) : null}
      </div>

      {assetProfile ? (
        <LoadingOverlay isLoaded={isLoaded} assetProfile={assetProfile} />
      ) : null}

      {assetProfile ? (
        <ViewerHud
          settings={settings}
          viewPreset={viewPreset}
          assetProfile={assetProfile}
          isFullscreen={isFullscreen}
          onSettingsChange={updateSettings}
          onViewChange={changeView}
          onReset={resetView}
          onFullscreen={toggleFullscreen}
        />
      ) : null}

      {contextLost ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-background/94 px-5 backdrop-blur-lg">
          <div className="glass-panel max-w-sm rounded-2xl p-7 text-center">
            <AlertTriangle className="mx-auto size-8 text-amber-300" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Phiên đồ họa 3D đã bị gián đoạn
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bộ xử lý đồ họa có thể vừa đổi trạng thái hoặc thiếu bộ nhớ.
              Tải lại sẽ tạo phiên hiển thị mới.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              <RefreshCw />
              Khởi tạo lại
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { AircraftViewer };
