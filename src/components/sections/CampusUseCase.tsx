import Image from "next/image";
import { Radio, DoorOpen, Volume2, Lightbulb, RotateCw } from "lucide-react";
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
      tone="surface"
      eyebrow="CAMPUS"
      title="엘리베이터를 타고 층을 넘나듭니다"
      description="배달은 한 층에서 끝나지 않습니다. Delibot은 무선으로 엘리베이터를 직접 호출하고 탑승합니다."
    >
      <Reveal>
        <Card tone="bg" className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
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
                { icon: Radio, label: "2.4GHz NRF24L01 무선 링크" },
                { icon: DoorOpen, label: "서보 모터 2개 (문 / 층 이동)" },
                { icon: Volume2, label: "부저 음성 피드백" },
                { icon: Lightbulb, label: "전원·디버그·에러 상태 LED" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 font-medium text-ink"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.15} className="mt-6">
        <Card tone="bg" className="overflow-hidden !p-0">
          <div className="p-6 pb-0 md:p-8 md:pb-0">
            <h3 className="flex items-center gap-2 text-xl font-bold text-navy md:text-2xl">
              3D로 직접 살펴보세요
              <RotateCw className="h-5 w-5 text-mint-strong" aria-hidden />
            </h3>
            <p className="mt-2 text-sm text-muted">
              마우스로 드래그하면 돌려볼 수 있어요. 실제 설계한 보드의 3D 모델입니다.
            </p>
          </div>
          <div className="mt-4 h-[26rem] w-full md:h-[32rem]">
            <Elevator3DShowcase />
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}
