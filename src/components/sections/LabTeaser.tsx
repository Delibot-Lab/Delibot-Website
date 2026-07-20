import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function LabTeaser() {
  return (
    <section className="bg-bg py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-[2.5rem] border border-border bg-gradient-to-br from-surface to-surface-alt px-6 py-16 text-center md:px-16">
            <Image
              src="/delibot-logo.png"
              alt="CBSH DeliBot Lab"
              width={72}
              height={72}
              className="rounded-2xl"
            />
            <h2 className="text-3xl font-bold tracking-tight text-navy md:text-4xl">
              CBSH DeliBot Lab
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
              펌웨어부터 회로 설계, 웹 도구까지 — 로봇 하나를 완성하기 위한
              모든 과정을 직접 만들어가는 학생 랩입니다.
            </p>
            <Button href="/about">랩 소개 보러가기</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
