"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    console.error("AeroView renderer failed", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="viewer-shell relative grid size-full place-items-center px-5">
        <div className="glass-panel max-w-md rounded-2xl p-7 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <h1 className="mt-5 text-lg font-semibold text-white">
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
            Tải lại viewer
          </Button>
          <details className="mt-5 text-left text-[11px] text-muted-foreground">
            <summary className="cursor-pointer text-center">Chi tiết kỹ thuật</summary>
            <code className="mt-2 block max-h-24 overflow-auto rounded-lg bg-black/20 p-3">
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
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#17181c] px-6 text-center">
      <div className="max-w-sm">
        <AlertTriangle className="mx-auto size-8 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">Thiết bị không hỗ trợ WebGL</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Hãy bật hardware acceleration hoặc thử Chrome, Edge hay Firefox phiên bản mới.
        </p>
      </div>
    </div>
  );
}

export { ViewerErrorBoundary, WebGLFallback };
