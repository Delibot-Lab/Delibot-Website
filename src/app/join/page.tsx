import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JoinForm } from "@/components/join/JoinForm";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `팀원 모집 | ${siteConfig.name}`,
  description: `${siteConfig.labName}과 함께할 팀원을 모집합니다.`,
};

export default function JoinPage() {
  return (
    <>
      <section className="bg-bg pb-8 pt-20 md:pt-28">
        <Container>
          <Reveal className="flex flex-col items-center gap-5 text-center">
            <span className="inline-flex w-fit items-center rounded-full bg-mint/15 px-4 py-1.5 text-sm font-semibold text-mint-strong">
              JOIN US
            </span>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-navy md:text-5xl">
              Delibot과 함께할 팀원을 찾습니다
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              로봇 하나를 처음부터 끝까지 직접 만들어볼 팀원을 기다립니다.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-bg pb-24">
        <Container>
          <div className="mx-auto mb-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {siteConfig.recruitTeams.map((team, i) => (
              <Reveal key={team.id} delay={i * 0.08}>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
                  <team.icon
                    aria-hidden
                    className="h-6 w-6 shrink-0 text-mint-strong"
                  />
                  <div>
                    <h3 className="font-bold text-navy">{team.label}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {team.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mx-auto max-w-2xl rounded-3xl border border-border bg-bg p-6 md:p-10">
            <JoinForm />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
