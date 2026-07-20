"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      {visible ? (
        <StepViewer url="/models/elevator-controller.step" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted">
          스크롤하면 3D 모델을 불러옵니다
        </div>
      )}
    </div>
  );
}
