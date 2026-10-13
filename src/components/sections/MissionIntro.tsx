import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

export function MissionIntro({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  return (
    <section id="vision" className="relative overflow-hidden bg-white py-32 md:py-48">
      <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#edf9f3] blur-3xl" aria-hidden />
      <Container className="relative">
        <Reveal className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-extrabold tracking-[0.18em] text-[#43b98c]">OUR VISION</p>
          <h2 className="mt-7 text-[clamp(2.35rem,5.2vw,5rem)] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#191f28]">
            {en ? <><span className="block md:whitespace-nowrap">So robots never stop at the door.</span><span className="block text-[#8b95a1] md:whitespace-nowrap">We build the entire journey.</span></> : <><span className="block md:whitespace-nowrap">로봇이 문 앞에서 멈추지 않도록.</span><span className="block text-[#8b95a1] md:whitespace-nowrap">우리는 이동의 전 과정을 만듭니다.</span></>}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-[#6b7684] md:text-xl">
            {en ? "From mechanics and firmware to autonomy, elevator integration, and the web — every discipline connects to bring one robot to life." : "기구 설계부터 펌웨어, 자율주행, 엘리베이터 연동과 웹까지. 하나의 로봇을 위해 서로 다른 기술이 연결되는 경험을 합니다."}
          </p>
          <Link href="/about" className="group mt-10 inline-flex items-center gap-1.5 font-bold text-[#43b98c]">{en ? "How we build" : "우리가 만드는 방식"} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
        </Reveal>
      </Container>
    </section>
  );
}
