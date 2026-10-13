import { Hero } from "@/components/sections/Hero";
import { ScrollFilm } from "@/components/sections/ScrollFilm";
import { BlogInvitation } from "@/components/sections/BlogInvitation";
import { CtaSection } from "@/components/sections/CtaSection";
import { getPublicTeamProfiles } from "@/lib/team-server";

export default async function Home() {
  const members = await getPublicTeamProfiles();
  return (
    <>
      <Hero />
      <ScrollFilm members={members} />
      <BlogInvitation />
      <CtaSection />
    </>
  );
}
