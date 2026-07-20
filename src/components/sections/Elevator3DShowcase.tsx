"use client";

import dynamic from "next/dynamic";

const StepViewer = dynamic(
  () => import("@/components/three/StepViewer").then((m) => m.StepViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted">
        3D 뷰어를 불러오는 중...
      </div>
    ),
  }
);

export function Elevator3DShowcase() {
  return <StepViewer url="/models/elevator-controller.step" />;
}
