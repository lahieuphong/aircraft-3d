"use client";

import dynamic from "next/dynamic";

import { MuseumLogo } from "@/components/brand/museum-logo";

const AircraftViewer = dynamic(
  () =>
    import("@/components/viewer/aircraft-viewer").then(
      (module) => module.AircraftViewer,
    ),
  {
    ssr: false,
    loading: () => <ViewerBootScreen />,
  },
);

function ViewerEntry() {
  return <AircraftViewer />;
}

function ViewerBootScreen() {
  return (
    <div className="viewer-shell relative grid size-full place-items-center overflow-hidden">
      <div className="glass-panel hud-corners w-[min(88vw,360px)] px-7 py-8 text-center">
        <MuseumLogo
          size={72}
          priority
          className="mx-auto mb-5 rounded-full border border-primary/15 shadow-lg"
        />
        <p className="technical-label text-[9px] text-primary">
          Bảo tàng Chứng tích Chiến tranh
        </p>
        <h1 className="mt-2 text-lg font-medium tracking-[-0.02em] text-foreground">
          Đang khởi tạo trải nghiệm 3D
        </h1>
        <div className="loading-track mt-6 h-1 overflow-hidden rounded-full">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export { ViewerEntry };
