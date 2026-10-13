import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function BlogInvitation({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return (
    <section id="after-film" className="scroll-mt-16 bg-white py-32 md:py-48">
      <Container>
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-extrabold tracking-[.2em] text-mint-strong">FROM VISION TO REALITY</p>
          <h2 className="mt-6 text-[clamp(2.7rem,6vw,6rem)] font-extrabold leading-[1.04] tracking-[-.055em] text-[#191f28]">{en ? <>Want to see<br /><span className="text-[#8b95a1]">what we actually built?</span></> : <>상상이 실제가 되는 과정이<br /><span className="text-[#8b95a1]">궁금하다면.</span></>}</h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg font-medium leading-relaxed text-muted">{en ? "Our circuit boards, battery pack, 3D models, firmware, and every failed experiment are documented in the development blog." : "직접 만든 회로 보드와 배터리, 3D 모델, 펌웨어와 수많은 시행착오를 개발 블로그에 기록하고 있습니다."}</p>
          <Link href="/blog" className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-[#191f28] px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#333d4b]">{en ? "Read the build stories" : "실제 제작 과정 보러가기"}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
        </Reveal>
      </Container>
    </section>
  );
}
