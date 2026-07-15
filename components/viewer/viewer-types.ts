export type ViewPreset = "iso" | "front" | "side" | "top";
export type RenderQuality = "balanced" | "quality";
export type AssetProfile = "mobile" | "pc";

export const ASSET_PROFILES: Record<
  AssetProfile,
  { filename: string; label: string; badgeLabel: string }
> = {
  mobile: {
    filename: "aircraft-mobile.glb",
    label: "Thiết bị di động",
    badgeLabel: "MOBILE · 512",
  },
  pc: {
    filename: "aircraft-pc.glb",
    label: "Máy tính",
    badgeLabel: "PC · 1K",
  },
};

export type ViewerSettings = {
  autoRotate: boolean;
  showGrid: boolean;
  wireframe: boolean;
  exposure: number;
  environmentIntensity: number;
  quality: RenderQuality;
};

export const MODEL_STATS = {
  triangles: "259,3 k",
  meshes: "25",
  materials: "25",
  dimensions: "13,52 × 5,43 × 13,52 m",
} as const;
