"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type OcctMesh = {
  name: string;
  attributes: {
    position: { array: number[] };
    normal?: { array: number[] };
  };
  index: { array: number[] };
  color?: [number, number, number];
};

function buildGroup(meshes: OcctMesh[]): THREE.Group {
  const group = new THREE.Group();

  for (const m of meshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(m.attributes.position.array, 3)
    );
    if (m.attributes.normal) {
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(m.attributes.normal.array, 3)
      );
    } else {
      geometry.computeVertexNormals();
    }
    geometry.setIndex(
      new THREE.BufferAttribute(Uint32Array.from(m.index.array), 1)
    );

    const material = new THREE.MeshStandardMaterial({
      color: m.color
        ? new THREE.Color(m.color[0], m.color[1], m.color[2])
        : 0x7fc9a8,
      metalness: 0.1,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = m.name;
    group.add(mesh);
  }

  return group;
}

export function StepViewer({ url }: { url: string }) {
  const [group, setGroup] = useState<THREE.Group | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const occtimportjs = (await import("occt-import-js")).default;
        const occt = await occtimportjs({
          locateFile: () => "/wasm/occt-import-js.wasm",
        });

        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const result = occt.ReadStepFile(new Uint8Array(buffer), null);

        if (cancelled) return;
        if (!result.success || result.meshes.length === 0) {
          setStatus("error");
          return;
        }

        setGroup(buildGroup(result.meshes));
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="relative h-full w-full">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          3D 모델을 불러오는 중...
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-danger">
          모델을 불러오지 못했습니다.
        </div>
      )}
      {status === "ready" && group && (
        <Canvas camera={{ fov: 45, position: [4, 4, 4] }} dpr={[1, 2]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={1.1} />
          <directionalLight position={[-5, -3, -5]} intensity={0.3} />
          <Bounds fit clip observe margin={1.3}>
            <primitive object={group} />
          </Bounds>
          <OrbitControls makeDefault enableDamping />
        </Canvas>
      )}
    </div>
  );
}
