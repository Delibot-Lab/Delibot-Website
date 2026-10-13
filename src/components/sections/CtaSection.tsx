import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export function CtaSection({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return (
    <section className="bg-[#17201d] py-28 md:py-36">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <p className="text-xs font-extrabold tracking-[.2em] text-[#86e0bd]">OPEN SOURCE · OPEN TEAM</p>
          <h2 className="text-4xl font-extrabold leading-tight tracking-[-.04em] text-white md:text-6xl">
            {en ? <>Build the<br />next scene with us.</> : <>다음 장면을<br />함께 만들 사람.</>}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            {en ? "From modeling and circuits to firmware, autonomy, and the web. Join a team that builds, tests, and learns together." : "모델링, 회로, 펌웨어, 자율주행과 웹까지. 완성된 답을 기다리기보다 직접 만들고 시험하는 팀에 합류하세요."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/join" variant="secondary">
              {en ? "Join the team" : "팀원 지원하기"}
            </Button>
            <Button
              href={siteConfig.githubOrgUrl}
              external
              variant="ghost"
              className="border-white/20 bg-white/10 text-white"
            >
              {en ? "View on GitHub" : "GitHub에서 보기"}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
