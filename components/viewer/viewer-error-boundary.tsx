"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { MuseumLogo } from "@/components/brand/museum-logo";
import { Button } from "@/components/ui/button";

type ViewerErrorBoundaryProps = {
  children: ReactNode;
};

type ViewerErrorBoundaryState = {
  error: Error | null;
};

class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  state: ViewerErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ViewerErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("War Remnants Museum 3D renderer failed", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="viewer-shell relative grid size-full place-items-center px-5">
        <div className="glass-panel max-w-md rounded-2xl p-7 text-center">
          <div className="relative mx-auto w-fit">
            <MuseumLogo size={64} className="rounded-full border border-primary/15 shadow-md" />
            <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-background bg-destructive text-primary-foreground">
              <AlertTriangle className="size-3.5" />
            </span>
          </div>
          <h1 className="mt-5 text-lg font-semibold text-foreground">
            Không thể mở mô hình 3D
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            WebGL có thể đã hết bộ nhớ hoặc thiết bị không hỗ trợ định dạng texture cần thiết.
          </p>
          <Button
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-4" />
            Tải lại trình xem
          </Button>
          <details className="mt-5 text-left text-[11px] text-muted-foreground">
            <summary className="cursor-pointer text-center">Chi tiết kỹ thuật</summary>
            <code className="mt-2 block max-h-24 overflow-auto rounded-lg bg-secondary/60 p-3">
              {this.state.error.message}
            </code>
          </details>
        </div>
      </div>
    );
  }
}

function WebGLFallback() {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <MuseumLogo size={64} className="mx-auto rounded-full border border-primary/15 shadow-md" />
        <div className="mt-5 flex items-center justify-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <h2 className="text-lg font-semibold text-foreground">Thiết bị không hỗ trợ WebGL</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Hãy bật hardware acceleration hoặc thử Chrome, Edge hay Firefox phiên bản mới.
        </p>
      </div>
    </div>
  );
}

export { ViewerErrorBoundary, WebGLFallback };
