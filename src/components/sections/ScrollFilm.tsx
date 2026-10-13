"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { initials, type TeamProfile } from "@/lib/team";

type FilmScene = { src: string; chapter: string; ko: string; en: string; koBody: string; enBody: string; fit?: "cover" | "contain"; quiet?: boolean; teamLabel?: string; realAsset?: boolean };

const scenes: FilmScene[] = [
  { src: "/delibot-story-load.png", chapter: "ACT I · PREPARE", ko: "보내는 마음까지 싣고,", en: "Loaded with care.", koBody: "동아리원이 배송물을 확인하고 Delibot의 수납함을 닫습니다.", enBody: "A team member checks the parcel and closes Delibot's cargo bay." },
  { src: "/delibot-campus.webp", chapter: "01 · DEPART", ko: "캠퍼스의 길을 읽고,", en: "Read the campus.", koBody: "하나의 목적지를 향해 긴 여정을 시작합니다.", enBody: "One destination begins a journey across the whole campus." },
  { src: "/delibot-sensing.webp", chapter: "02 · SENSE", ko: "사람과 공간을 감지하고,", en: "Sense every change.", koBody: "센서는 움직이는 환경을 매 순간 새롭게 이해합니다.", enBody: "Sensors understand a changing environment, moment by moment." },
  { src: "/delibot-controller-pcb-cutout.png", chapter: "BUILT · DELIBOT CONTROL", ko: "움직임의 중심도, 직접.", en: "The center of every movement.", koBody: "구동과 센서, 전원을 연결하는 Delibot 컨트롤러 PCB를 직접 설계했습니다.", enBody: "We designed the Delibot controller PCB that connects motion, sensors, and power.", fit: "contain", realAsset: true },
  { src: "/delibot-film-lidar.png", chapter: "INSERT · LIDAR", ko: "보이지 않는 변화까지.", en: "See what others miss.", koBody: "라이다가 공간의 깊이와 움직임을 촘촘하게 읽습니다.", enBody: "LiDAR reads depth and motion across the space.", quiet: true },
  { src: "/delibot-film-call.png", chapter: "ACT II · THE CROSSING", ko: "멈춰 있던 층을 연결합니다.", en: "Connect the floors.", koBody: "직접 만든 제어 기술로 엘리베이터를 호출합니다.", enBody: "Our own control technology calls the elevator." },
  { src: "/elevator-controller-pcb-cutout.png", chapter: "BUILT · ELEVATOR CONTROL", ko: "층을 잇는 회로를, 직접.", en: "The circuit that connects floors.", koBody: "직접 설계한 엘리베이터 컨트롤러 PCB가 호출과 층간 이동을 연결합니다.", enBody: "Our elevator controller PCB connects the call to the journey between floors.", fit: "contain", realAsset: true },
  { src: "/delibot-elevator-entry.webp", chapter: "05 · ENTER", ko: "문이 열리는 순간,", en: "When the doors open.", koBody: "로봇의 경로는 건물 안쪽으로 계속 이어집니다.", enBody: "The route continues deeper into the building." },
  { src: "/delibot-film-wheel.png", chapter: "INSERT · THRESHOLD", ko: "작은 경계도 부드럽게.", en: "Cross every threshold.", koBody: "문턱 하나까지 계산하며 다음 공간으로 이동합니다.", enBody: "Even the smallest threshold becomes part of the route.", quiet: true },
  { src: "/delibot-film-inside.png", chapter: "07 · RIDE", ko: "좁은 공간에서도 정확하게.", en: "Stay precise inside.", koBody: "위치와 방향을 놓치지 않은 채 문이 닫히기를 기다립니다.", enBody: "It holds position and direction as the doors close." },
  { src: "/delibot-film-rise.png", chapter: "INSERT · RISING", ko: "이동은 위로 이어지고,", en: "The journey rises.", koBody: "엘리베이터의 움직임과 함께 새로운 층으로 향합니다.", enBody: "The elevator carries the journey toward a new floor.", quiet: true },
  { src: "/delibot-film-exit.png", chapter: "09 · ARRIVE", ko: "새로운 층을 다시 읽습니다.", en: "Read a new floor.", koBody: "열린 문 너머의 환경을 즉시 다음 경로로 연결합니다.", enBody: "Beyond the doors, a new environment becomes the next route." },
  { src: "/delibot-night.webp", chapter: "10 · KEEP MOVING", ko: "시간이 달라져도,", en: "Even after hours.", koBody: "필요한 순간까지 캠퍼스를 멈추지 않고 이동합니다.", enBody: "Delibot keeps moving across campus whenever it is needed." },
  { src: "/delibot-story-wait.png", chapter: "ACT III · THE ARRIVAL", ko: "도착을 기다리는 동안,", en: "While someone waits.", koBody: "Delibot은 마지막 복도를 지나 약속한 장소로 향합니다.", enBody: "Delibot crosses the final corridor toward the promised place." },
  { src: "/delibot-film-cargo.png", chapter: "INSERT · CARGO", ko: "배송의 안쪽까지 안전하게.", en: "Protected all the way.", koBody: "수납함 안의 작은 디테일까지 배송을 위해 설계합니다.", enBody: "Every detail inside the cargo bay is designed for delivery.", quiet: true },
  { src: "/delibot-film-delivery.png", chapter: "12 · DELIVER", ko: "마침내, 필요한 사람에게.", en: "Finally, to the person waiting.", koBody: "한 층을 넘는 기술이 하나의 배송 경험을 완성합니다.", enBody: "Technology that crosses floors completes one delivery." },
  { src: "/delibot-story-handoff.png", chapter: "ACT III · RECEIVED", ko: "한 번의 배송이 완성됩니다.", en: "One delivery, complete.", koBody: "기술은 결국 누군가의 평범한 하루에 도착합니다.", enBody: "Technology finally arrives in someone's ordinary day." },
  { src: "/object-wheel.webp", chapter: "TEAM 01", ko: "모델링팀", en: "Modeling Team", koBody: "로봇의 형태와 움직임을 설계합니다.", enBody: "Designing the robot's form and movement.", fit: "contain", teamLabel: "모델링팀" },
  { src: "/object-controller.webp", chapter: "TEAM 02", ko: "회로팀", en: "Circuit Team", koBody: "신호와 전원을 하나의 회로로 연결합니다.", enBody: "Connecting signals and power into one system.", fit: "contain", teamLabel: "회로팀" },
  { src: "/object-battery.webp", chapter: "TEAM 03", ko: "프로그래밍팀", en: "Programming Team", koBody: "판단하고 움직이는 로봇의 코드를 만듭니다.", enBody: "Writing the code that decides and moves.", fit: "contain", teamLabel: "프로그래밍팀" },
  { src: "/object-package.webp", chapter: "TEAM 04", ko: "서버팀", en: "Server Team", koBody: "로봇과 사람을 서비스로 연결합니다.", enBody: "Connecting the robot and people through services.", fit: "contain", teamLabel: "서버팀" },
  { src: "/delibot-engineering.webp", chapter: "EPILOGUE · ENGINEERED", ko: "이 모든 움직임을, 직접 설계합니다.", en: "Every movement, engineered by us.", koBody: "회로와 전원, 모터와 코드가 정교하게 맞물려 하나의 배송이 됩니다.", enBody: "Circuits, power, motors, and code come together as one delivery." },
];

export function ScrollFilm({ locale = "ko", members = [] }: { locale?: "ko" | "en"; members?: TeamProfile[] }) {
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const en = locale === "en";

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(scenes.length - 1, Math.max(0, Math.round(value * (scenes.length - 1))));
    setActiveIndex((current) => current === next ? current : next);
  });

  return (
    <section ref={ref} aria-label={en ? "Delibot story" : "Delibot 스토리"} className="relative h-[1250svh] bg-[#0b100e]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#0b100e]">
        {scenes.map((scene, index) => <FilmFrame key={scene.src} scene={scene} index={index} activeIndex={activeIndex} progress={scrollYProgress} en={en} members={members} />)}
        <div className="pointer-events-none absolute inset-0 z-[35] bg-[radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,.45)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[36] opacity-[.055] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.9%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.8%22/%3E%3C/svg%3E')]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        <a href="#after-film" className="absolute left-5 top-5 z-50 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[11px] font-bold text-white/72 backdrop-blur-md transition hover:bg-black/60 hover:text-white md:left-8 md:top-7">{en ? "Skip story ↓" : "스토리 건너뛰기 ↓"}</a>
        <div className="absolute bottom-7 left-7 z-50 hidden text-[10px] font-extrabold tracking-[.2em] text-white/55 sm:block md:left-10">DELIBOT · A SCROLL FILM</div>
        <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 md:right-10">
          <span className="min-w-[3.5rem] text-right text-[10px] font-extrabold tabular-nums tracking-[.12em] text-white/55">{String(activeIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20 md:w-32"><motion.div style={{ scaleX: scrollYProgress, transformOrigin: "left" }} className="h-full bg-[#6fddb3]" /></div>
        </div>
      </div>
    </section>
  );
}

function FilmFrame({ scene, index, activeIndex, progress, en, members }: { scene: FilmScene; index: number; activeIndex: number; progress: MotionValue<number>; en: boolean; members: TeamProfile[] }) {
  const reduced = useReducedMotion();
  const count = scenes.length;
  const center = index / (count - 1);
  const segment = 1 / (count - 1);
  // 컷 사이에는 아주 짧은 암전을 둔다. 두 이미지와 두 카피가 동시에 남는
  // 디졸브보다 한 프레임씩 명확히 보이는 편이 이 시퀀스에 더 영화적이다.
  const hold = segment * 0.43;
  const edge = segment * 0.485;
  const input = index === 0 ? [0, center + hold, center + edge] : index === count - 1 ? [center - edge, center - hold, 1] : [center - edge, center - hold, center + hold, center + edge];
  const output = index === 0 ? [1, 1, 0] : index === count - 1 ? [0, 1, 1] : [0, 1, 1, 0];
  const opacity = useTransform(progress, input, output);
  const scale = useTransform(progress, [Math.max(0, center - 0.11), Math.min(1, center + 0.11)], reduced ? [1, 1] : index % 2 ? [1.12, 1.02] : [1.02, 1.14]);
  const x = useTransform(progress, [Math.max(0, center - 0.11), Math.min(1, center + 0.11)], reduced ? [0, 0] : index % 2 ? [32, -28] : [-28, 32]);
  const copyX = useTransform(progress, [Math.max(0, center - hold), Math.min(1, center + hold)], reduced ? [0, 0] : index % 2 ? [18, -12] : [-18, 12]);
  const teamMembers = scene.teamLabel ? members.filter((member) => member.teams.includes(scene.teamLabel!)) : [];
  const shouldLoadImage = Math.abs(index - activeIndex) <= 2;

  return (
    <motion.article style={{ opacity }} className="absolute inset-0 bg-[#0b100e]">
      <motion.div style={{ scale, x }} className={`absolute inset-[-4%] ${scene.fit === "contain" ? `bg-[#0b100e] ${scene.realAsset ? "bg-[radial-gradient(circle_at_72%_48%,rgba(87,199,156,.25),transparent_34%),linear-gradient(120deg,#0b100e_35%,#101b17)]" : "bg-[radial-gradient(circle_at_center,rgba(87,199,156,.2),#0b100e_58%)]"}` : ""}`}>
        {shouldLoadImage && <Image src={scene.src} alt="" fill sizes="108vw" className={scene.teamLabel ? "object-contain p-[12vw] opacity-20 saturate-50" : scene.realAsset ? "object-contain object-center p-[clamp(5rem,11vw,12rem)] drop-shadow-[0_40px_65px_rgba(0,0,0,.58)] md:object-[72%_center]" : scene.fit === "contain" ? "object-contain p-[10vw]" : "object-cover"} priority={index < 2} />}
      </motion.div>
      <div className={`absolute inset-0 ${index % 2 ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-black/68 via-black/16 to-transparent`} />
      <div className="absolute right-5 top-5 z-30 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/75 backdrop-blur-md">{scene.realAsset ? (en ? "Actual PCB 3D capture · background removed" : "실제 제작 PCB 3D 캡처 · 배경 제거") : (en ? "AI-generated Delibot concept image" : "AI로 생성한 Delibot 콘셉트 이미지")}</div>
      {scene.teamLabel ? (
        <div className="absolute inset-0 z-20 flex flex-col px-6 py-20 text-white sm:px-12 md:px-20 md:py-20">
          <div>
            <p className="text-xs font-extrabold tracking-[.22em] text-[#86e0bd] md:text-sm">{scene.chapter}</p>
            <h2 className={`mt-4 text-[clamp(3.5rem,8vw,8.5rem)] font-extrabold leading-[.9] tracking-[-.065em] ${en ? "" : "[word-break:keep-all]"}`}>{en ? scene.en : scene.ko}</h2>
            <p className={`mt-4 hidden max-w-xl text-base font-medium text-white/60 sm:block md:text-xl ${en ? "" : "[word-break:keep-all]"}`}>{en ? scene.enBody : scene.koBody}</p>
          </div>
          <div className="mt-auto">
            <div className="mb-5 flex items-center gap-4"><span className="h-px w-10 bg-[#86e0bd]" /><p className="text-xs font-extrabold tracking-[.24em] text-[#a6e9cf]">{en ? "THE TEAM" : "함께 만드는 팀원들"}</p></div>
            {teamMembers.length > 0 ? <div className="flex gap-4 overflow-x-auto pb-3 md:gap-6">{teamMembers.map((member) => (
              <Link key={member.user_id} href={`${en ? "/en" : ""}/team/${member.slug}`} className="group relative flex min-w-[175px] flex-col overflow-hidden rounded-[1.35rem] border border-[#8ae1bf]/25 bg-black/35 p-3 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#8ae1bf]/70 hover:bg-white/10 sm:min-w-[210px] sm:p-4 md:min-w-[250px]">
                <span className="absolute right-4 top-4 text-[10px] font-black tracking-[.18em] text-[#8ae1bf]/70">MAKER</span>
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#8ae1bf]/45 bg-[#2f7258] shadow-[0_0_35px_rgba(111,221,179,.18)] sm:h-24 sm:w-24 md:h-28 md:w-28">{member.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드 이미지 URL
                  <img src={member.avatar_url} alt={member.display_name} className="h-full w-full object-cover" />
                ) : <span className="flex h-full items-center justify-center text-4xl font-black">{initials(member.display_name)}</span>}</div>
                <div className="mt-3 min-w-0 sm:mt-5"><strong className="block truncate text-lg font-extrabold tracking-[-.03em] sm:text-xl">{member.display_name}</strong><span className="mt-1 block truncate text-xs text-white/55 sm:mt-1.5 sm:text-sm">{en ? member.role_en || member.role_ko || scene.en : member.role_ko || member.role_en || scene.ko}</span></div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#91e5c4] opacity-70 transition group-hover:opacity-100 sm:mt-5">{en ? "View profile" : "프로필 보기"} <span aria-hidden>↗</span></span>
              </Link>
            ))}</div> : <p className="text-sm text-white/38">{en ? "No member profiles yet." : "등록된 팀원 프로필이 없습니다."}</p>}
          </div>
        </div>
      ) : (
      <motion.div style={{ x: copyX }} className={`absolute z-20 flex w-full max-w-3xl flex-col px-7 text-white sm:px-12 md:px-20 ${scene.quiet ? "inset-x-0 bottom-20" : "inset-y-0 justify-center"} ${scene.realAsset ? "left-0 items-start text-left" : index % 2 ? "right-0 items-end text-right" : "left-0 items-start text-left"}`}>
        <p className="text-xs font-extrabold tracking-[.22em] text-[#86e0bd] md:text-sm">{scene.chapter}</p>
        {!scene.quiet && <><h2 className={`mt-5 max-w-[14ch] text-[clamp(2.6rem,6.2vw,7rem)] font-extrabold leading-[.98] tracking-[-.055em] [text-wrap:balance] ${en ? "" : "[word-break:keep-all]"}`}>{en ? scene.en : scene.ko}</h2>
        <p className={`mt-6 max-w-xl text-base font-medium leading-relaxed text-white/72 md:text-xl ${en ? "" : "[word-break:keep-all] [text-wrap:balance]"}`}>{en ? scene.enBody : scene.koBody}</p></>}
      </motion.div>
      )}
    </motion.article>
  );
}
