import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { simplifyPrimitive, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/optimize-geometry.mjs <input.glb> <output.glb>");
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const document = await io.read(inputPath);
const root = document.getRoot();

await MeshoptSimplifier.ready;
await document.transform(weld({ overwrite: false }));

let optimizedPrimitives = 0;
let preservedGlassPrimitives = 0;

for (const mesh of root.listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    const materialName = primitive
      .getMaterial()
      ?.getName()
      .trim()
      .toLowerCase();

    if (materialName === "mat 20") {
      preservedGlassPrimitives += 1;
      continue;
    }

    simplifyPrimitive(primitive, {
      simplifier: MeshoptSimplifier,
      ratio: 0.7,
      error: 0.001,
      lockBorder: true,
    });
    optimizedPrimitives += 1;
  }
}

await io.write(outputPath, document);
console.log(
  `Optimized ${optimizedPrimitives} opaque primitives; preserved ${preservedGlassPrimitives} glass primitives.`,
);
