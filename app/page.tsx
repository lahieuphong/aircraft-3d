import { ViewerEntry } from "@/components/viewer/viewer-entry";

export default function HomePage() {
  return (
    <main className="h-dvh min-h-[620px] w-full overflow-hidden bg-background text-foreground">
      <ViewerEntry />
    </main>
  );
}
