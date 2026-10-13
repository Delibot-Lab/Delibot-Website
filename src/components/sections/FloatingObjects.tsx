"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function FloatingObjects({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const ref = useRef<HTMLElement>(null);
  const en = locale === "en";
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const boxX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-220, 280]);
  const boxY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [260, -260]);
  const boxRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-22, 120]);
  const wheelX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [260, -300]);
  const wheelY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-250, 260]);
  const wheelRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, -210]);
  const boardX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-320, 210]);
  const boardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-130, 210]);
  const boardRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [12, -48]);
  const batteryX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [310, -180]);
  const batteryY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [200, -190]);
  const batteryRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-12, 60]);
  const copyScale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.85, 1, 1.12]);

  return (
    <section ref={ref} className="relative h-[300svh] bg-[#121816]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(87,199,156,.18),transparent_58%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:80px_80px]" />

        <motion.div style={{ scale: copyScale }} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-xs font-extrabold tracking-[.22em] text-[#86e0bd]">ONE ROBOT · MANY DISCIPLINES</p>
          <h2 className="mt-6 max-w-5xl text-[clamp(3.2rem,8vw,8rem)] font-extrabold leading-[.92] tracking-[-.065em]">{en ? <>Everything moves<br />as one.</> : <>모든 기술이<br />하나로 움직이도록.</>}</h2>
          <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-white/60 md:text-xl">{en ? "Mechanics, circuits, power, and software — connected by one team." : "기구, 회로, 전원과 소프트웨어. 서로 다른 기술을 하나의 팀이 연결합니다."}</p>
          <Link href="/join" className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-[#57c79c] px-6 py-3.5 font-bold text-[#10241d] transition hover:bg-[#7cddb8]">{en ? "Build with us" : "Delibot 팀과 함께하기"}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
        </motion.div>

        <motion.div style={{ x: boxX, y: boxY, rotate: boxRotate }} className="absolute left-[7%] top-[10%] z-20 w-[clamp(10rem,20vw,23rem)] drop-shadow-[0_30px_35px_rgba(0,0,0,.35)]"><Image src="/object-package.webp" alt="" width={1400} height={1248} /></motion.div>
        <motion.div style={{ x: wheelX, y: wheelY, rotate: wheelRotate }} className="absolute right-[5%] top-[12%] z-20 w-[clamp(10rem,18vw,21rem)] drop-shadow-[0_30px_35px_rgba(0,0,0,.45)]"><Image src="/object-wheel.webp" alt="" width={1400} height={1400} /></motion.div>
        <motion.div style={{ x: boardX, y: boardY, rotate: boardRotate }} className="absolute bottom-[3%] left-[4%] z-20 w-[clamp(13rem,24vw,28rem)] mix-blend-screen"><Image src="/object-controller.webp" alt="" width={1536} height={1024} /></motion.div>
        <motion.div style={{ x: batteryX, y: batteryY, rotate: batteryRotate }} className="absolute bottom-[1%] right-[3%] z-20 w-[clamp(13rem,23vw,27rem)] mix-blend-screen"><Image src="/object-battery.webp" alt="" width={1536} height={1024} /></motion.div>
        <div className="absolute bottom-5 right-5 z-30 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/60 backdrop-blur">{en ? "AI-generated concept objects" : "AI로 생성한 콘셉트 오브젝트"}</div>
      </div>
    </section>
  );
}
