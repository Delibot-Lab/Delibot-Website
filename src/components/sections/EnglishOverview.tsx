import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, CircuitBoard, Radio, Route } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  { icon: CircuitBoard, title: "Built from the board up", body: "A 200Hz STM32 control loop, wheel encoders, and a 9-axis IMU keep every movement precise." },
  { icon: Radio, title: "Safe by design", body: "Delibot switches seamlessly between CRSF remote control and Raspberry Pi autonomous commands." },
  { icon: Route, title: "Made for every floor", body: "Our custom wireless controller calls the elevator and keeps the delivery moving beyond a single level." },
  { icon: BatteryCharging, title: "Energy to keep going", body: "A custom 3S 14,400mAh battery pack powers the robot and its onboard systems." },
];

export function EnglishOverview() {
  return <>
    <section className="bg-[#f5f7f6] px-5 py-28 md:px-8 md:py-40"><div className="mx-auto max-w-6xl"><Reveal><p className="text-sm font-extrabold tracking-[.18em] text-mint-strong">ENGINEERED AS ONE</p><h2 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-[-.04em] text-[#191f28] md:text-7xl">One robot.<br /><span className="text-[#b0b8c1]">Every discipline connected.</span></h2></Reveal><div className="mt-16 grid gap-4 md:grid-cols-2">{features.map((item, i) => <Reveal key={item.title} delay={i * .06} className="h-full"><article className="h-full rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(25,31,40,.35)] md:p-10"><item.icon className="h-8 w-8 text-mint-strong" /><h3 className="mt-8 text-2xl font-bold text-[#191f28]">{item.title}</h3><p className="mt-3 max-w-lg leading-relaxed text-[#6b7684]">{item.body}</p></article></Reveal>)}</div></div></section>
    <section className="overflow-hidden bg-white px-5 py-28 md:px-8 md:py-40"><div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2"><Reveal><p className="text-sm font-extrabold tracking-[.18em] text-mint-strong">REAL HARDWARE</p><h2 className="mt-5 text-4xl font-extrabold tracking-[-.04em] text-[#191f28] md:text-6xl">Designed, tested,<br />and built by us.</h2><p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6b7684]">Explore our actual elevator controller in 3D, then follow the build through our open development notes.</p><Link href="/blog" className="group mt-8 inline-flex items-center gap-2 font-bold text-mint-strong">Read the build stories <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link></Reveal><Reveal delay={.12}><div className="relative aspect-square rounded-[3rem] bg-[#edf8f3]"><Image src="/elevator-board-render.png" alt="Delibot elevator controller PCB" fill className="object-contain p-10" sizes="50vw" /></div></Reveal></div></section>
  </>;
}
