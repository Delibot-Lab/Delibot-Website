"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

export function Hero({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const ref = useRef<HTMLElement>(null);
  const en = locale === "en";
  const reduced = useReducedMotion();
  const [copyHidden, setCopyHidden] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.72], reduced ? [1, 1] : [0.965, 1.12]);
  const radius = useTransform(scrollYProgress, [0, 0.55], [32, 0]);
  const shade = useTransform(scrollYProgress, [0, 0.7], [0.54, 0.3]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > 0.48) setCopyHidden(true);
    if (value < 0.025) setCopyHidden(false);
  });

  return (
    <section ref={ref} className="relative h-[150svh] bg-white">
      <div className="sticky top-0 h-svh overflow-hidden p-3 md:p-4">
        <motion.div style={{ scale, borderRadius: radius }} className="relative h-full w-full origin-center overflow-hidden bg-[#17201d] shadow-[0_30px_80px_-35px_rgba(17,24,22,.4)]">
          <Image src="/delibot-campus-hero.webp" alt={en ? "An autonomous delivery robot waiting by an elevator" : "엘리베이터 앞에 도착한 자율주행 배달 로봇"} fill priority sizes="100vw" className="object-cover object-[62%_center]" />
          <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

          <motion.div animate={{ y: copyHidden && !reduced ? -80 : 0, opacity: copyHidden ? 0 : 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-0 bottom-0 z-10 px-7 pb-12 text-white sm:px-10 md:px-16 md:pb-16 lg:px-24 lg:pb-20">
            <p className="mb-5 text-xs font-extrabold tracking-[.22em] text-[#86e0bd] md:text-sm">CBSH DELIBOT LAB · AUTONOMOUS DELIVERY</p>
            <h1 className={`max-w-[14ch] text-[clamp(3rem,7.2vw,7.5rem)] font-extrabold leading-[.96] tracking-[-.055em] [text-wrap:balance] ${en ? "" : "[word-break:keep-all]"}`}>
              {en ? <>Delivery beyond<br />every floor.</> : <>배달의 경계를<br />층 너머로.</>}
            </h1>
            <p className={`mt-6 max-w-xl text-base font-medium leading-relaxed text-white/75 md:text-xl ${en ? "" : "[word-break:keep-all] [text-wrap:balance]"}`}>
              {en ? "We build an autonomous delivery robot that rides elevators and moves freely across campus." : "엘리베이터를 타고 캠퍼스를 누비는 자율주행 배달 로봇. 하드웨어부터 소프트웨어까지, 우리가 직접 만듭니다."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join" className="group inline-flex items-center gap-2 rounded-xl bg-[#57c79c] px-5 py-3 font-bold text-[#10241d] transition hover:bg-[#7cddb8]">{en ? "Join the Delibot team" : "Delibot 팀과 함께하기"}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
              <Link href="/blog" className="rounded-xl bg-white/15 px-5 py-3 font-bold text-white backdrop-blur-md transition hover:bg-white/25">{en ? "Dev stories" : "개발 기록"}</Link>
            </div>
          </motion.div>

          <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-[10px] font-bold tracking-[.18em] text-white/60 md:flex">SCROLL TO ENTER <ArrowDown className="h-4 w-4 animate-bounce" /></div>
          <div className="absolute right-5 top-5 z-20 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/75 backdrop-blur-md">{en ? "AI-generated Delibot concept image" : "AI로 생성한 Delibot 콘셉트 이미지"}</div>
        </motion.div>
      </div>
    </section>
  );
}
