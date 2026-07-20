import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const stats = [
  "200Hz 실시간 제어 루프",
  "CRSF + 라즈베리파이 이중화",
  "IMU 보정 자율주행",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-16 pb-24 md:pt-24 md:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-mint/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 left-[-15%] h-[24rem] w-[24rem] rounded-full bg-peach/30 blur-3xl"
      />

      <Container className="relative grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <Reveal>
          <span className="inline-flex w-fit items-center rounded-full bg-mint/15 px-4 py-1.5 text-sm font-semibold text-mint-strong">
            CBSH DeliBot Lab
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-navy sm:text-5xl md:text-6xl">
            캠퍼스를 누비는
            <br />
            배달 로봇, Delibot
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            RC 조종과 라즈베리파이 자율 명령을 오가며, 계단 대신 엘리베이터를
            타고 건물 사이를 오가는 캠퍼스 배달 로봇을 만들고 있습니다.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/blog">블로그 보러가기</Button>
            <Button href="/about" variant="ghost">
              프로젝트 소개
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted">
            {stats.map((stat) => (
              <li key={stat} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                {stat}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={0.15}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-[8/5] overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_30px_60px_-25px_rgba(44,62,80,0.35)]">
            <Image
              src="/delibot-logo.png"
              alt="Delibot 로봇 마스코트"
              fill
              sizes="(min-width: 768px) 28rem, 90vw"
              className="object-cover object-top"
              priority
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
