import { Hero } from "@/components/sections/Hero";
import { RobotOverview } from "@/components/sections/RobotOverview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CampusUseCase } from "@/components/sections/CampusUseCase";
import { LabTeaser } from "@/components/sections/LabTeaser";
import { CtaSection } from "@/components/sections/CtaSection";

export default function Home() {
  return (
    <>
      <Hero />
      <RobotOverview />
      <HowItWorks />
      <CampusUseCase />
      <LabTeaser />
      <CtaSection />
    </>
  );
}
