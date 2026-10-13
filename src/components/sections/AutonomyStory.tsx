import { Building2, Cpu, Radio } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { number: "01", kicker: "SENSE", title: "주변을 읽고", enTitle: "Sense the world", description: "엔코더와 9축 IMU가 로봇의 속도와 자세를 실시간으로 감지합니다.", enDescription: "Wheel encoders and a 9-axis IMU track speed and orientation in real time.", icon: Radio },
  { number: "02", kicker: "DECIDE", title: "스스로 판단하고", enTitle: "Make every decision", description: "200Hz 제어 루프가 조종 신호와 자율 명령의 우선순위를 안전하게 결정합니다.", enDescription: "A 200Hz control loop safely prioritizes remote and autonomous commands.", icon: Cpu },
  { number: "03", kicker: "MOVE", title: "층을 넘어 이동합니다", enTitle: "Move beyond floors", description: "무선 제어 보드로 엘리베이터를 호출하고 목적지 층까지 경로를 이어갑니다.", enDescription: "Our wireless controller calls the elevator and continues the route on the destination floor.", icon: Building2 },
];

export function AutonomyStory({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return (
    <section className="bg-[#f7f8f7] py-28 md:py-40">
      <Container>
        <Reveal>
          <p className="text-xs font-extrabold tracking-[.2em] text-mint-strong">HOW IT MOVES</p>
          <h2 className="mt-5 max-w-4xl text-[clamp(2.8rem,6vw,5.8rem)] font-extrabold leading-[1.02] tracking-[-.05em] text-[#191f28]">
            {en ? <>Set the destination.<br /><span className="text-[#8b95a1]">We handle the rest.</span></> : <>목적지만 정하면,<br /><span className="text-[#8b95a1]">나머지는 Delibot이.</span></>}
          </h2>
        </Reveal>
        <div className="mt-20 grid border-y border-black/[.07] md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return <Reveal key={step.number} delay={index * 0.08} className="h-full"><article className="h-full border-black/[.07] py-9 md:border-l md:px-8 md:first:border-l-0 lg:px-10"><div className="flex items-center justify-between"><span className="text-xs font-extrabold tracking-[.18em] text-mint-strong">{step.number} · {step.kicker}</span><Icon className="h-5 w-5 text-mint-strong" aria-hidden /></div><h3 className="mt-10 text-2xl font-extrabold tracking-[-.03em] text-[#191f28] md:text-3xl">{en ? step.enTitle : step.title}</h3><p className="mt-4 max-w-sm text-base font-medium leading-relaxed text-muted">{en ? step.enDescription : step.description}</p></article></Reveal>;
          })}
        </div>
      </Container>
    </section>
  );
}
