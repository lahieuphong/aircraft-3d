"use client";

import {
  type ElementRef,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  CameraControls,
  ContactShadows,
  Environment,
  Grid,
  Lightformer,
} from "@react-three/drei";
import {
  AgXToneMapping,
  FrontSide,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  NormalBlending,
  SRGBColorSpace,
  Texture,
  type WebGLRenderer,
} from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type {
  RenderQuality,
  ViewPreset,
} from "@/components/viewer/viewer-types";

const MODEL_OFFSET: [number, number, number] = [0.213, 0.729, 0.149];
const CAMERA_TARGET: [number, number, number] = [0, 2.72, 0];

const CAMERA_PRESETS: Record<
  ViewPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  iso: { position: [18.5, 12, 20.5], target: CAMERA_TARGET },
  front: { position: [28, 5.8, 0], target: CAMERA_TARGET },
  side: { position: [0, 5.8, 28], target: CAMERA_TARGET },
  top: { position: [0, 31, 0.01], target: [0, 0.8, 0] },
};

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/decoders/draco/");

const ktx2Loaders = new WeakMap<WebGLRenderer, KTX2Loader>();

function getKTX2Loader(renderer: WebGLRenderer) {
  const cachedLoader = ktx2Loaders.get(renderer);
  if (cachedLoader) return cachedLoader;

  const loader = new KTX2Loader();
  loader.setTranscoderPath("/decoders/basis/");
  loader.setWorkerLimit(2);
  loader.detectSupport(renderer);
  ktx2Loaders.set(renderer, loader);
  return loader;
}

type AircraftSceneProps = {
  modelUrl: string;
  autoRotate: boolean;
  showGrid: boolean;
  wireframe: boolean;
  exposure: number;
  environmentIntensity: number;
  quality: RenderQuality;
  mobileOptimized: boolean;
  viewPreset: ViewPreset;
  viewRevision: number;
  onModelReady: () => void;
  onContextLost: (lost: boolean) => void;
};

function AircraftScene({
  modelUrl,
  autoRotate,
  showGrid,
  wireframe,
  exposure,
  environmentIntensity,
  quality,
  mobileOptimized,
  viewPreset,
  viewRevision,
  onModelReady,
  onContextLost,
}: AircraftSceneProps) {
  return (
    <>
      <RendererSettings exposure={exposure} onContextLost={onContextLost} />
      <CameraRig preset={viewPreset} revision={viewRevision} />
      <AdaptiveDpr pixelated />

      <ambientLight color="#ffffff" intensity={0.16 * environmentIntensity} />
      <directionalLight
        color="#fffaf2"
        intensity={1.05 * environmentIntensity}
        position={[8, 14, 9]}
      />
      <directionalLight
        color="#d8deea"
        intensity={0.28 * environmentIntensity}
        position={[-12, 5, -10]}
      />

      <Suspense fallback={null}>
        <Environment
          environmentIntensity={0.62 * environmentIntensity}
          resolution={
            mobileOptimized ? (quality === "quality" ? 128 : 64) : quality === "quality" ? 256 : 128
          }
        >
          <Lightformer
            form="rect"
            color="#fffaf4"
            intensity={1.75}
            position={[0, 12, -10]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[12, 12, 1]}
          />
          <Lightformer
            form="rect"
            color="#d9dce5"
            intensity={0.75}
            position={[-10, 4, 2]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[10, 8, 1]}
          />
          <Lightformer
            form="ring"
            color="#ffffff"
            intensity={0.3}
            position={[8, 2, 8]}
            rotation={[0, -Math.PI / 4, 0]}
            scale={5}
          />
        </Environment>

        <RotatingModel active={autoRotate} resetRevision={viewRevision}>
          <AircraftModel
            modelUrl={modelUrl}
            wireframe={wireframe}
            onReady={onModelReady}
          />
        </RotatingModel>

        <ContactShadows
          position={[0, 0.015, 0]}
          opacity={quality === "quality" ? 0.36 : 0.25}
          scale={28}
          blur={2.6}
          far={12}
          resolution={
            mobileOptimized ? (quality === "quality" ? 256 : 128) : quality === "quality" ? 512 : 256
          }
          frames={1}
          color="#111216"
        />
      </Suspense>

      {showGrid ? (
        <Grid
          position={[0, 0.02, 0]}
          args={[34, 34]}
          cellSize={0.5}
          cellThickness={0.45}
          cellColor="#45474e"
          sectionSize={2.5}
          sectionThickness={0.8}
          sectionColor="#777a82"
          fadeDistance={32}
          fadeStrength={1.1}
          infiniteGrid
        />
      ) : null}
    </>
  );
}

type AircraftModelProps = {
  modelUrl: string;
  wireframe: boolean;
  onReady: () => void;
};

function AircraftModel({
  modelUrl,
  wireframe,
  onReady,
}: AircraftModelProps) {
  const renderer = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const gltf = useLoader(GLTFLoader, modelUrl, (loader) => {
    loader.setCrossOrigin("anonymous");
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(getKTX2Loader(renderer));
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const glassMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        name: "Mat 20",
        color: "#d9e3e6",
        metalness: 0,
        roughness: 0.18,
        transparent: true,
        opacity: 0.24,
        side: FrontSide,
        depthWrite: false,
        depthTest: true,
        blending: NormalBlending,
        forceSinglePass: true,
      }),
    [],
  );
  const { scene, ownedMaterials } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);
    const clonedMaterials = new Set<Material>();

    clonedScene.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const materials = sourceMaterials.map((material) => {
        if (material.name.trim().toLowerCase() === "mat 20") {
          object.renderOrder = 20;
          return glassMaterial;
        }

        const clonedMaterial = material.clone();
        clonedMaterials.add(clonedMaterial);
        return clonedMaterial;
      });

      object.material = Array.isArray(object.material) ? materials : materials[0];
    });

    return {
      scene: clonedScene,
      ownedMaterials: Array.from(clonedMaterials),
    };
  }, [glassMaterial, gltf.scene]);

  useEffect(() => {
    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      object.castShadow = false;
      object.receiveShadow = false;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      for (const material of materials) {
        if (material instanceof MeshStandardMaterial) {
          material.wireframe = wireframe;
          material.needsUpdate = true;
        }

        for (const value of Object.values(material)) {
          if (value instanceof Texture) {
            value.anisotropy = maxAnisotropy;
            value.needsUpdate = true;
          }
        }
      }
    });

    invalidate();
  }, [invalidate, renderer, scene, wireframe]);

  useEffect(() => () => glassMaterial.dispose(), [glassMaterial]);
  useEffect(
    () => () => {
      for (const material of ownedMaterials) material.dispose();
    },
    [ownedMaterials],
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <primitive
      object={scene}
      position={MODEL_OFFSET}
      dispose={null}
    />
  );
}

type RotatingModelProps = {
  active: boolean;
  resetRevision: number;
  children: ReactNode;
};

function RotatingModel({ active, resetRevision, children }: RotatingModelProps) {
  const group = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!group.current) return;
    group.current.rotation.y = 0;
    invalidate();
  }, [invalidate, resetRevision]);

  useFrame((_, delta) => {
    if (!active || !group.current) return;
    group.current.rotation.y += delta * 0.13;
  });

  return <group ref={group}>{children}</group>;
}

type CameraRigProps = {
  preset: ViewPreset;
  revision: number;
};

function CameraRig({ preset, revision }: CameraRigProps) {
  const controls = useRef<ElementRef<typeof CameraControls> | null>(null);

  useEffect(() => {
    const camera = CAMERA_PRESETS[preset];
    const [px, py, pz] = camera.position;
    const [tx, ty, tz] = camera.target;
    void controls.current?.setLookAt(px, py, pz, tx, ty, tz, revision > 0);
  }, [preset, revision]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.48}
      draggingSmoothTime={0.12}
      minDistance={4.2}
      maxDistance={58}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.015}
      dollySpeed={0.7}
      truckSpeed={1.4}
      dollyToCursor
    />
  );
}

type RendererSettingsProps = {
  exposure: number;
  onContextLost: (lost: boolean) => void;
};

function RendererSettings({ exposure, onContextLost }: RendererSettingsProps) {
  const renderer = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // Three.js exposes renderer exposure as a mutable runtime property.
    // eslint-disable-next-line react-hooks/immutability
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = AgXToneMapping;
    renderer.toneMappingExposure = exposure;
    invalidate();
  }, [exposure, invalidate, renderer]);

  useEffect(() => {
    const canvas = renderer.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onContextLost(true);
    };
    const handleRestored = () => onContextLost(false);

    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", handleRestored, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
      canvas.removeEventListener("webglcontextrestored", handleRestored, false);
    };
  }, [onContextLost, renderer]);

  return null;
}

export { AircraftScene };
