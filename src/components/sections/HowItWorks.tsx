import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const priority = [
  {
    step: "1순위",
    title: "CRSF 무선 조종",
    description:
      "TBS CRSF 수신기 신호가 300ms 이내로 살아있으면 언제나 이 명령이 우선합니다.",
  },
  {
    step: "2순위",
    title: "라즈베리파이 자율 명령",
    description:
      "CRSF 연결이 끊기면 UART로 들어오는 라즈베리파이의 속도 명령으로 자동 전환됩니다(500ms 데드맨 타임아웃).",
  },
  {
    step: "안전장치",
    title: "Failsafe 정지",
    description: "두 명령 소스가 모두 끊기면 모터를 즉시 정지시킵니다.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="HOW IT WORKS"
      title="사람과 자율주행 사이, 안전하게 전환됩니다"
      description="Delibot의 컨트롤러는 매 5ms(200Hz)마다 누가 로봇을 조종할지 판단하고, 엔코더·IMU 데이터로 바퀴 속도를 보정합니다."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {priority.map((item, i) => (
          <Reveal key={item.step} delay={i * 0.1}>
            <Card tone="bg" className="h-full border-2 border-border">
              <span className="text-xs font-bold uppercase tracking-wide text-mint-strong">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-bold text-navy">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3} className="mt-10">
        <Card tone="surface">
          <p className="text-sm leading-relaxed text-muted md:text-base">
            <span className="font-semibold text-navy">
              STM32 ↔ 라즈베리파이
            </span>
            는{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-sm text-navy">
              [0xFF][LEN][CMD][DATA...][CRC]
            </code>{" "}
            형식의 자체 UART 프로토콜로 통신하며, 20ms마다 텔레메트리(요, 좌우
            바퀴 속도)를 주고받습니다.
          </p>
        </Card>
      </Reveal>
    </Section>
  );
}
