import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/prepare-model.mjs <input.glb> <output.glb>");
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const document = await io.read(inputPath);
const materials = document.getRoot().listMaterials();
const glass = materials.find(
  (material) => material.getName().trim().toLowerCase() === "mat 20",
);

if (!glass) {
  throw new Error("Không tìm thấy material kính 'Mat 20'.");
}

glass
  .setBaseColorTexture(null)
  .setNormalTexture(null)
  .setMetallicRoughnessTexture(null)
  .setBaseColorFactor([0.85, 0.9, 0.93, 0.24])
  .setMetallicFactor(0)
  .setRoughnessFactor(0.18)
  .setAlphaMode("BLEND")
  .setDoubleSided(false);

await document.transform(prune());
await io.write(outputPath, document);

console.log(
  "Prepared Mat 20: alpha glass, FrontSide, non-metallic; removed unused glass maps.",
);
