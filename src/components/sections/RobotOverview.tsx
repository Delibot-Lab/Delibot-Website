import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

const parts = [
  {
    tag: "구동",
    color: "mint" as const,
    title: "2륜 차동 구동",
    description:
      "좌우 바퀴를 독립적으로 제어해 제자리 회전부터 정밀한 직진 주행까지 소화합니다.",
  },
  {
    tag: "두뇌",
    color: "teal" as const,
    title: "STM32F401CCU6",
    description:
      "ARM Cortex-M4F 기반 컨트롤러가 5ms(200Hz)마다 제어 루프를 돌며 로봇을 지휘합니다.",
  },
  {
    tag: "구동계",
    color: "peach" as const,
    title: "L298N 모터 드라이버",
    description:
      "PWM 신호로 두 바퀴의 속도와 회전 방향을 정밀하게 구동합니다.",
  },
  {
    tag: "센서",
    color: "mint" as const,
    title: "엔코더 + BNO080 IMU",
    description:
      "쿼드러처 엔코더로 바퀴 회전을, 9축 IMU로 자세를 읽어 PID 제어로 속도와 방향을 보정합니다.",
  },
];

export function RobotOverview() {
  return (
    <Section
      id="robot"
      tone="surface"
      eyebrow="ROBOT"
      title="Delibot을 움직이는 하드웨어"
      description="캠퍼스 바닥과 문턱, 코너를 안정적으로 지나가기 위해 구동부터 센서까지 직접 설계했습니다."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((part, i) => (
          <Reveal key={part.title} delay={i * 0.08}>
            <Card className="h-full">
              <Badge color={part.color}>{part.tag}</Badge>
              <h3 className="mt-4 text-lg font-bold text-navy">
                {part.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {part.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.32} className="mt-5">
        <Card tone="bg" className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl bg-surface">
            <Image
              src="/battery.png"
              alt="Delibot 자체 제작 배터리팩"
              fill
              sizes="220px"
              className="object-contain"
            />
          </div>
          <div>
            <Badge color="peach">전원</Badge>
            <h3 className="mt-4 text-lg font-bold text-navy">
              3S 14400mAh 자체 제작 배터리팩
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
              내장 BEC를 함께 설계해 배터리 직접 출력과 BEC 출력을 동시에
              사용할 수 있고, BEC 출력은 USB-C 커넥터로 나와 주변 전장을 함께
              구동합니다.
            </p>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}
