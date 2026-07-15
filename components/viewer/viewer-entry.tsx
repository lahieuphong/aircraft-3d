"use client";

import dynamic from "next/dynamic";

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
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full border border-primary/20 bg-primary/10">
          <span className="size-2 animate-pulse rounded-full bg-primary shadow-[0_0_18px_#f28c28]" />
        </div>
        <p className="technical-label text-[10px] text-primary">AeroView engine</p>
        <h1 className="mt-2 text-lg font-medium tracking-[-0.02em] text-white">
          Đang khởi tạo WebGL
        </h1>
        <div className="loading-track mt-6 h-1 overflow-hidden rounded-full">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export { ViewerEntry };
