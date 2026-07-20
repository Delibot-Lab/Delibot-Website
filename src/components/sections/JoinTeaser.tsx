import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site";

export function JoinTeaser() {
  return (
    <Section
      id="join"
      eyebrow="JOIN US"
      title="Delibot과 함께할 팀원을 찾습니다"
      description="모델링, 회로, 프로그래밍, 서버까지 — 로봇 하나를 완성하는 모든 과정에 참여할 사람을 기다립니다."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.recruitTeams.map((team, i) => (
          <Reveal key={team.id} delay={i * 0.08}>
            <Card className="h-full">
              <IconBadge icon={team.icon} />
              <h3 className="mt-3 text-base font-bold text-navy">
                {team.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {team.description}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3} className="mt-10 flex justify-center">
        <Button href="/join">팀원 지원하기</Button>
      </Reveal>
    </Section>
  );
}
