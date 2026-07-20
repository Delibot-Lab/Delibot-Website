import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

export function CampusUseCase() {
  return (
    <Section
      id="campus"
      tone="surface"
      eyebrow="CAMPUS"
      title="엘리베이터를 타고 층을 넘나듭니다"
      description="배달은 한 층에서 끝나지 않습니다. Delibot은 무선으로 엘리베이터를 직접 호출하고 탑승합니다."
    >
      <Reveal>
        <Card tone="bg" className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface">
            <Image
              src="/elevator-board-render.png"
              alt="Delibot Elevator Controller PCB 렌더"
              fill
              sizes="(min-width: 768px) 24rem, 90vw"
              className="object-contain"
            />
          </div>

          <div>
            <Badge color="teal">Elevator-Controller-PCB</Badge>
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
                "2.4GHz NRF24L01 무선 링크",
                "서보 모터 2개 (문 / 층 이동)",
                "부저 음성 피드백",
                "전원·디버그·에러 상태 LED",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-2xl bg-surface px-4 py-3 font-medium text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}
