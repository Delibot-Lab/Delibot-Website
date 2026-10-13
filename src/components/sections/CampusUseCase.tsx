import Image from "next/image";
import { Radio, DoorOpen, Volume2, Lightbulb, RotateCw, Cpu, BatteryCharging, Gauge } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Parallax";
import { Elevator3DShowcase } from "./Elevator3DShowcase";

export function CampusUseCase() {
  return (
    <Section
      id="campus"
      tone="bg"
      eyebrow="REAL BUILD · 실제 제작물"
      title={<>아이디어를 넘어,<br />실제로 작동하는 로봇으로.</>}
      description="아래의 배터리, 제어 보드, 회로도와 3D 모델은 모두 Delibot 팀이 직접 설계하거나 제작한 실제 결과물입니다."
    >
      <Reveal className="mb-20">
        <div className="grid border-y border-black/[.07] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Gauge, value: "200Hz", label: "실시간 제어 루프" },
            { icon: Cpu, value: "STM32", label: "Cortex-M4F 컨트롤러" },
            { icon: Radio, value: "2.4GHz", label: "엘리베이터 무선 링크" },
            { icon: BatteryCharging, value: "14,400mAh", label: "자체 제작 3S 배터리" },
          ].map((item) => <div key={item.value} className="border-black/[.07] px-3 py-8 sm:px-7 sm:[&:nth-child(even)]:border-l lg:border-l lg:first:border-l-0"><item.icon className="h-5 w-5 text-mint-strong" /><p className="mt-5 text-3xl font-extrabold tracking-[-.04em] text-[#191f28]">{item.value}</p><p className="mt-1 text-sm font-medium text-muted">{item.label}</p></div>)}
        </div>
      </Reveal>

      <Reveal className="mb-6">
        <div className="grid overflow-hidden rounded-[2.5rem] bg-[#edf8f3] lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-[28rem] lg:min-h-[38rem]">
            <Image src="/battery.png" alt="Delibot 팀이 실제 제작한 3S 14400mAh 배터리팩" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-contain p-10 md:p-16" />
          </div>
          <div className="px-8 pb-12 lg:px-16 lg:pb-0">
            <p className="text-xs font-extrabold tracking-[.18em] text-mint-strong">POWERED BY US · 실제 제작물</p>
            <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-.04em] text-[#191f28] md:text-5xl">오래 달리기 위한<br />에너지부터 직접.</h3>
            <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-muted md:text-lg">3S 14,400mAh 배터리팩과 내장 BEC를 함께 제작했습니다. USB-C 출력으로 로봇의 주변 전장까지 안정적으로 구동합니다.</p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Card tone="surface" className="grid gap-8 !rounded-[2.5rem] md:grid-cols-[1fr_1.2fr] md:items-center">
          <Parallax
            y={[24, -24]}
            scale={[0.92, 1.04]}
            className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface"
          >
            <Image
              src="/elevator-board-render.png"
              alt="Delibot Elevator Controller PCB 렌더"
              fill
              sizes="(min-width: 768px) 24rem, 90vw"
              className="object-contain"
              priority
            />
          </Parallax>

          <div>
            <Badge color="mint">Elevator-Controller-PCB</Badge>
            <h3 className="mt-4 text-2xl font-bold text-navy">
              Arduino Nano + NRF24L01 무선 제어 보드
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              2.4GHz NRF24L01 무선 모듈로 명령을 받아 서보 모터 2개로
              엘리베이터의 문과 층 이동을 제어하고, 부저와 상태 LED로 동작을
              알립니다. 이 보드 덕분에 Delibot은 사람 없이도 엘리베이터를
              호출해 목적지 층까지 스스로 이동할 수 있습니다.
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Radio, label: "2.4GHz NRF24L01 무선 링크" },
                { icon: DoorOpen, label: "서보 모터 2개 (문 / 층 이동)" },
                { icon: Volume2, label: "부저 음성 피드백" },
                { icon: Lightbulb, label: "전원·디버그·에러 상태 LED" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 font-medium text-ink"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-mint-strong" aria-hidden />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.15} className="mt-6">
        <Card tone="surface" className="overflow-hidden !rounded-[2.5rem] !p-0">
          <div className="p-6 pb-0 md:p-8 md:pb-0">
            <h3 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-.03em] text-[#191f28] md:text-4xl">
              스크롤로 살펴보는 실제 3D 설계
              <RotateCw className="h-5 w-5 text-mint-strong" aria-hidden />
            </h3>
            <p className="mt-2 text-sm text-muted">
              스크롤하면 시점이 움직이고, 마우스로 직접 드래그할 수도 있습니다. 실제 제작에 사용한 STEP 모델입니다.
            </p>
          </div>
          <div className="mt-4 h-[26rem] w-full md:h-[32rem]">
            <Elevator3DShowcase />
          </div>
        </Card>
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Reveal>
          <figure className="overflow-hidden rounded-[2rem] border border-black/[.05] bg-white shadow-[0_18px_50px_-38px_rgba(25,31,40,.32)]">
            <div className="relative aspect-[4/3] bg-[#fbfbfb]">
              <Image src="/elevator-schematic.jpg" alt="실제 Delibot 엘리베이터 컨트롤러 회로도" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-5 transition duration-500 hover:scale-[1.025]" />
            </div>
            <figcaption className="border-t border-black/[.05] px-6 py-5">
              <p className="text-[10px] font-extrabold tracking-[.18em] text-mint-strong">REAL ARTIFACT · 실제 제작물</p>
              <h3 className="mt-2 text-xl font-bold text-[#191f28]">엘리베이터 컨트롤러 회로도</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">전원, 디버그 LED, 서보 모터와 NRF24L01 무선 통신부를 설계한 실제 회로도입니다.</p>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.08}>
          <figure className="overflow-hidden rounded-[2rem] border border-black/[.05] bg-white shadow-[0_18px_50px_-38px_rgba(25,31,40,.32)]">
            <div className="relative aspect-[4/3] bg-[#071323]">
              <Image src="/elevator-pcb-layout.png" alt="실제 Delibot 엘리베이터 컨트롤러 PCB 레이아웃" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-5 transition duration-500 hover:scale-[1.025]" />
            </div>
            <figcaption className="border-t border-black/[.05] px-6 py-5">
              <p className="text-[10px] font-extrabold tracking-[.18em] text-mint-strong">REAL ARTIFACT · 실제 제작물</p>
              <h3 className="mt-2 text-xl font-bold text-[#191f28]">PCB 배치와 배선</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">직접 배치하고 라우팅한 엘리베이터 제어 보드의 실제 PCB 설계 화면입니다.</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
