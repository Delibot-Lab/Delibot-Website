import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export function CtaSection() {
  return (
    <section className="bg-navy py-24 md:py-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Delibot 프로젝트가 궁금하신가요?
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            펌웨어, 라즈베리파이 라이브러리, 웹 컨피규레이터까지 모든 코드는
            GitHub에 공개되어 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={siteConfig.githubOrgUrl} external variant="secondary">
              GitHub에서 보기
            </Button>
            <Button
              href="/blog"
              variant="ghost"
              className="border-white/20 bg-white/10 text-white"
            >
              블로그 보러가기
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
