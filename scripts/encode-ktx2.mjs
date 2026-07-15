import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRTextureBasisu } from "@gltf-transform/extensions";
import { encodeToKTX2 } from "ktx2-encoder";
import sharp from "sharp";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/encode-ktx2.mjs <input.glb> <output.glb>");
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const document = await io.read(inputPath);
const root = document.getRoot();
const colorTextures = new Set();
const normalTextures = new Set();

for (const material of root.listMaterials()) {
  const baseColorTexture = material.getBaseColorTexture();
  const emissiveTexture = material.getEmissiveTexture();
  const normalTexture = material.getNormalTexture();
  if (baseColorTexture) colorTextures.add(baseColorTexture);
  if (emissiveTexture) colorTextures.add(emissiveTexture);
  if (normalTexture) normalTextures.add(normalTexture);
}

async function decodeImage(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8Array(data),
    width: info.width,
    height: info.height,
  };
}

const textures = root.listTextures();

for (const [index, texture] of textures.entries()) {
  const image = texture.getImage();
  if (!image) continue;

  const isNormalMap = normalTextures.has(texture);
  const isColorTexture = colorTextures.has(texture) && !isNormalMap;
  const encoded = await encodeToKTX2(image, {
    imageDecoder: decodeImage,
    isUASTC: false,
    qualityLevel: isNormalMap ? 220 : 190,
    compressionLevel: 2,
    generateMipmap: true,
    isNormalMap,
    isPerceptual: isColorTexture,
    isSetKTX2SRGBTransferFunc: isColorTexture,
    needSupercompression: false,
    enableDebug: false,
  });

  texture.setImage(encoded).setMimeType("image/ktx2");
  console.log(
    `[${index + 1}/${textures.length}] ${texture.getName() || "texture"} → ${(
      encoded.byteLength /
      1024
    ).toFixed(1)} KiB`,
  );
}

document.createExtension(KHRTextureBasisu).setRequired(true);
await io.write(outputPath, document);

console.log(`Encoded ${textures.length} textures to ETC1S KTX2 with mipmaps.`);
