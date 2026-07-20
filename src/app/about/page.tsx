import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `랩 소개 | ${siteConfig.name}`,
  description: `${siteConfig.labName}과 Delibot 프로젝트를 소개합니다.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-bg pb-8 pt-20 md:pt-28">
        <Container>
          <Reveal className="flex flex-col items-center gap-5 text-center">
            <span className="inline-flex w-fit items-center rounded-full bg-mint/15 px-4 py-1.5 text-sm font-semibold text-mint-strong">
              ABOUT
            </span>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-navy md:text-5xl">
              {siteConfig.labName}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              하드웨어, 펌웨어, 소프트웨어를 가리지 않고 로봇 하나를 처음부터
              끝까지 직접 만들어보는 학생 랩입니다.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section
        id="mission"
        align="left"
        eyebrow="MISSION"
        title="Delibot이란?"
        description="캠퍼스 안에서 사람이 하던 배달을 로봇이 대신하도록, 구동부터 통신·엘리베이터 연동까지 전 과정을 직접 설계·제작하는 프로젝트입니다."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <h3 className="text-base font-bold text-navy">왜 시작했나</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              계단과 문턱, 여러 층으로 나뉜 건물 구조 속에서도 물건을 안전하게
              옮길 수 있는 로봇을 직접 만들어보고 싶었습니다.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold text-navy">무엇을 만들었나</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              STM32 제어 펌웨어, 라즈베리파이 연동 라이브러리, 브라우저 기반
              보정 도구, 엘리베이터 무선 제어 PCB까지 전체 스택을 직접
              구현했습니다.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold text-navy">어떻게 배우나</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              제어이론, 임베디드 통신, 회로 설계, 웹 개발까지 — 로봇 하나에
              필요한 모든 영역을 팀원들이 나눠 맡으며 실전에서 배웁니다.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        id="repos"
        tone="surface"
        eyebrow="OPEN SOURCE"
        title="어떻게 만들어졌는지, 모두 공개되어 있어요"
        description="Delibot을 구성하는 모든 저장소는 GitHub에서 확인할 수 있습니다."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {siteConfig.repos.map((repo, i) => (
            <Reveal key={repo.url} delay={i * 0.08}>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="block h-full"
              >
                <Card
                  tone="bg"
                  className="h-full transition-transform hover:-translate-y-1"
                >
                  <h3 className="font-mono text-sm font-bold text-navy">
                    {repo.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {repo.description}
                  </p>
                </Card>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href={siteConfig.githubOrgUrl} external variant="ghost">
            GitHub Organization 보기
          </Button>
        </div>
      </Section>
    </>
  );
}
