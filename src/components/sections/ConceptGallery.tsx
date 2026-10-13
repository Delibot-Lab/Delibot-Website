"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const scenes = [
  {
    src: "/delibot-campus.webp",
    koTitle: "건물과 건물 사이도, 하나의 경로로.",
    enTitle: "One route, across the entire campus.",
    koBody: "실내와 실외, 서로 다른 건물을 이어 실제 캠퍼스 배달을 완성하는 모습을 그렸습니다.",
    enBody: "A vision of real campus delivery connecting indoor spaces, outdoor paths, and multiple buildings.",
    position: "object-center",
  },
  {
    src: "/delibot-engineering.webp",
    koTitle: "보이지 않는 안쪽까지 설계합니다.",
    enTitle: "Engineered from the inside out.",
    koBody: "제어기, 배터리, 모터와 센서가 하나의 시스템으로 연결되는 Delibot의 방향을 표현했습니다.",
    enBody: "Our vision for controllers, batteries, motors, and sensors working as one connected system.",
    position: "object-center",
  },
];

export function ConceptGallery({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return (
    <section className="bg-[#101513]">
      {scenes.map((scene, index) => (
        <ConceptScene key={scene.src} scene={scene} index={index} en={en} />
      ))}
    </section>
  );
}

function ConceptScene({ scene, index, en }: { scene: (typeof scenes)[number]; index: number; en: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : index === 0 ? [1.04, 1.2] : [1.16, 1.03]);
  const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : index === 0 ? [-36, 42] : [38, -32]);
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : index === 0 ? [24, -20] : [-16, 24]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : index === 0 ? [-0.5, 0.8] : [0.7, -0.5]);
  const radius = useTransform(scrollYProgress, [0, 0.18], [30, 0]);

  return (
      <article ref={ref} className="relative h-[145svh] bg-[#101513]">
        <motion.figure style={{ borderRadius: radius }} className="sticky top-0 h-svh overflow-hidden bg-[#18201d] p-0">
          <motion.div style={{ scale, x, y, rotate }} className="absolute inset-[-5%]">
            <Image src={scene.src} alt="" fill sizes="110vw" className={`object-cover ${scene.position}`} />
          </motion.div>
          <div className={`absolute inset-0 ${index === 0 ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-black/75 via-black/15 to-transparent`} />
          <figcaption className={`absolute inset-y-0 flex max-w-2xl flex-col justify-center px-8 text-white md:px-16 lg:px-24 ${index === 0 ? "right-0 items-end text-right" : "left-0 items-start text-left"}`}>
            <p className="text-xs font-extrabold tracking-[.2em] text-[#86e0bd]">DELIVERY, REIMAGINED</p>
            <h2 className="mt-5 text-[clamp(2.6rem,5vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-.05em]">{en ? scene.enTitle : scene.koTitle}</h2>
            <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-white/75 md:text-xl">{en ? scene.enBody : scene.koBody}</p>
          </figcaption>
          <div className="absolute right-5 top-5 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur-md">{en ? "AI-generated Delibot concept image" : "AI로 생성한 Delibot 콘셉트 이미지"}</div>
        </motion.figure>
      </article>
  );
}
