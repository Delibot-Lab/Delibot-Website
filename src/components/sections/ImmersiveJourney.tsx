"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const chapters = [
  { src: "/delibot-sensing.webp", label: "01 · SENSE", koTitle: "길을 읽고,", enTitle: "Read the way.", koBody: "센서가 공간의 변화와 로봇의 움직임을 매 순간 읽습니다.", enBody: "Sensors read the space and every movement, moment by moment.", side: "right" },
  { src: "/delibot-elevator-entry.webp", label: "02 · CONNECT", koTitle: "엘리베이터와 연결하고,", enTitle: "Connect every floor.", koBody: "직접 만든 무선 제어 보드로 이동이 끊기던 지점을 연결합니다.", enBody: "Our wireless controller connects the point where delivery used to stop.", side: "left" },
  { src: "/delibot-night.webp", label: "03 · KEEP MOVING", koTitle: "멈추지 않고 이동합니다.", enTitle: "Keep moving.", koBody: "건물과 시간의 경계를 넘어, 필요한 곳까지 스스로 도착합니다.", enBody: "Across buildings and beyond hours, Delibot reaches where it is needed.", side: "right" },
  { src: "/delibot-workshop.webp", label: "04 · BUILD", koTitle: "그리고, 전부 직접 만듭니다.", enTitle: "Then, we build it all.", koBody: "회로와 기구, 펌웨어와 웹이 하나의 로봇으로 이어집니다.", enBody: "Circuits, mechanics, firmware, and the web come together as one robot.", side: "left" },
];

export function ImmersiveJourney({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return <section className="bg-white">{chapters.map((chapter, index) => <JourneyChapter key={chapter.src} chapter={chapter} index={index} en={en} />)}</section>;
}

function JourneyChapter({ chapter, index, en }: { chapter: (typeof chapters)[number]; index: number; en: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const transforms = [
    { scale: [1.02, 1.2], x: [-45, 55], y: [20, -30], rotate: [-0.6, 0.8] },
    { scale: [1.14, 1.02], x: [42, -36], y: [-20, 24], rotate: [0.8, -0.4] },
    { scale: [1.03, 1.19], x: [-25, 38], y: [10, -22], rotate: [0.3, -0.7] },
    { scale: [1.16, 1.04], x: [38, -28], y: [-18, 18], rotate: [-0.5, 0.5] },
  ][index];
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : transforms.scale);
  const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : transforms.x);
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : transforms.y);
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : transforms.rotate);
  const copyY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, -20]);
  const radius = useTransform(scrollYProgress, [0, 0.22], [30, 0]);

  return (
    <article ref={ref} className="relative h-[155svh] bg-white">
      <div className="sticky top-0 h-svh overflow-hidden p-3 md:p-4">
        <motion.div style={{ borderRadius: radius }} className="relative h-full overflow-hidden bg-[#151b19]">
          <motion.div style={{ scale, x, y, rotate }} className="absolute inset-[-6%]">
            <Image src={chapter.src} alt="" fill sizes="112vw" className="object-cover" />
          </motion.div>
          <div className={`absolute inset-0 ${chapter.side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-black/78 via-black/20 to-transparent`} />
          <motion.div style={{ y: copyY }} className={`absolute inset-y-0 flex max-w-3xl flex-col justify-center px-8 text-white md:px-16 lg:px-24 ${chapter.side === "right" ? "right-0 items-end text-right" : "left-0 items-start text-left"}`}>
            <p className="text-xs font-extrabold tracking-[.22em] text-[#86e0bd] md:text-sm">{chapter.label}</p>
            <h2 className="mt-5 text-[clamp(3rem,6.5vw,7rem)] font-extrabold leading-[.98] tracking-[-.055em]">{en ? chapter.enTitle : chapter.koTitle}</h2>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/75 md:text-xl">{en ? chapter.enBody : chapter.koBody}</p>
          </motion.div>
          <div className="absolute right-5 top-5 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/80 backdrop-blur-md">{en ? "AI-generated Delibot concept image" : "AI로 생성한 Delibot 콘셉트 이미지"}</div>
          <div className="absolute bottom-6 left-1/2 h-1 w-24 -translate-x-1/2 overflow-hidden rounded-full bg-white/20"><motion.div style={{ scaleX: scrollYProgress, transformOrigin: "left" }} className="h-full bg-[#86e0bd]" /></div>
        </motion.div>
      </div>
    </article>
  );
}
