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
  CameraControlsImpl,
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
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type {
  RenderQuality,
  ViewPreset,
} from "@/components/viewer/viewer-types";

const MODEL_OFFSET: [number, number, number] = [0.213, 0.729, 0.149];
const CAMERA_TARGET: [number, number, number] = [0, 2.72, 0];
const MIN_CAMERA_DISTANCE = 0.1;
const MAX_CAMERA_DISTANCE = 36;
const MIN_CAMERA_ZOOM = 1;
const CAMERA_DOLLY_SPEED = 0.55;
const MAX_CAMERA_POLAR_ANGLE = Math.PI / 2 + Math.PI / 30;

const CAMERA_PRESETS: Record<
  ViewPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  iso: { position: [18.5, 12, 20.5], target: CAMERA_TARGET },
  front: { position: [28, 5.8, 0], target: CAMERA_TARGET },
  side: { position: [0, 5.8, 28], target: CAMERA_TARGET },
  top: { position: [0, 31, 0.01], target: [0, 0.8, 0] },
};

const MOBILE_ISO_CAMERA = {
  position: [21.3, 13.4, 23.6] as [number, number, number],
  target: CAMERA_TARGET,
};

const ktx2Loaders = new WeakMap<WebGLRenderer, KTX2Loader>();

function getKTX2Loader(renderer: WebGLRenderer) {
  const cachedLoader = ktx2Loaders.get(renderer);
  if (cachedLoader) return cachedLoader;

  const loader = new KTX2Loader();
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
      <CameraRig
        preset={viewPreset}
        revision={viewRevision}
        mobileOptimized={mobileOptimized}
      />
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
          color="#17384a"
        />
      </Suspense>

      {showGrid ? (
        <Grid
          position={[0, 0.02, 0]}
          args={[34, 34]}
          cellSize={0.5}
          cellThickness={0.45}
          cellColor="#7893a3"
          sectionSize={2.5}
          sectionThickness={0.8}
          sectionColor="#0a4b7f"
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
  mobileOptimized: boolean;
};

function CameraRig({ preset, revision, mobileOptimized }: CameraRigProps) {
  const controls = useRef<ElementRef<typeof CameraControls> | null>(null);
  const domElement = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const instance = controls.current;

    if (!instance) {
      return;
    }

    const { ACTION } = CameraControlsImpl;
    const syncMiddleButton = (event: {
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
    }) => {
      instance.mouseButtons.middle = event.shiftKey
        ? ACTION.TRUCK
        : event.ctrlKey || event.metaKey
          ? ACTION.DOLLY
          : ACTION.ROTATE;
    };
    const resetMiddleButton = () => {
      instance.mouseButtons.middle = ACTION.ROTATE;
    };

    instance.mouseButtons.left = ACTION.ROTATE;
    instance.mouseButtons.right = ACTION.TRUCK;
    instance.mouseButtons.wheel = ACTION.DOLLY;
    resetMiddleButton();

    domElement.addEventListener("pointerdown", syncMiddleButton, true);
    window.addEventListener("keydown", syncMiddleButton);
    window.addEventListener("keyup", syncMiddleButton);
    window.addEventListener("blur", resetMiddleButton);

    return () => {
      domElement.removeEventListener("pointerdown", syncMiddleButton, true);
      window.removeEventListener("keydown", syncMiddleButton);
      window.removeEventListener("keyup", syncMiddleButton);
      window.removeEventListener("blur", resetMiddleButton);
    };
  }, [domElement]);

  useEffect(() => {
    const camera =
      mobileOptimized && preset === "iso"
        ? MOBILE_ISO_CAMERA
        : CAMERA_PRESETS[preset];
    const [px, py, pz] = camera.position;
    const [tx, ty, tz] = camera.target;
    void controls.current?.setLookAt(px, py, pz, tx, ty, tz, revision > 0);
  }, [mobileOptimized, preset, revision]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.25}
      draggingSmoothTime={0.08}
      minDistance={MIN_CAMERA_DISTANCE}
      maxDistance={MAX_CAMERA_DISTANCE}
      minZoom={MIN_CAMERA_ZOOM}
      minPolarAngle={0}
      maxPolarAngle={MAX_CAMERA_POLAR_ANGLE}
      azimuthRotateSpeed={0.9}
      polarRotateSpeed={0.9}
      dollySpeed={CAMERA_DOLLY_SPEED}
      truckSpeed={1.5}
      dollyToCursor
      infinityDolly={false}
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
