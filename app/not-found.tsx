import type { Metadata } from "next";
import Link from "next/link";

import { MuseumLogo } from "@/components/brand/museum-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Không tìm thấy trang — Bảo tàng Chứng tích Chiến tranh",
  description: "Trang bạn đang tìm kiếm không tồn tại.",
};

export default function NotFound() {
  return (
    <main className="viewer-shell grid min-h-dvh place-items-center px-5 text-center">
      <section className="glass-panel w-full max-w-sm rounded-2xl p-7">
        <MuseumLogo
          size={64}
          priority
          className="mx-auto rounded-full border border-primary/15 shadow-md"
        />
        <p className="technical-label mt-5 text-[9px] text-primary">
          Bảo tàng Chứng tích Chiến tranh
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Không tìm thấy trang
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Trở về trình xem mô hình</Link>
        </Button>
      </section>
    </main>
  );
}
