import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ScrollFilm } from "@/components/sections/ScrollFilm";
import { BlogInvitation } from "@/components/sections/BlogInvitation";
import { CtaSection } from "@/components/sections/CtaSection";
import { getPublicTeamProfiles } from "@/lib/team-server";

export const metadata: Metadata = {
  title: "Autonomous Campus Delivery Robot",
  description: "Meet Delibot, an autonomous delivery robot engineered to travel across campus and ride elevators.",
  alternates: { canonical: "/en", languages: { ko: "/", en: "/en" } },
};

export default async function EnglishHome() {
  const members = await getPublicTeamProfiles();
  return <><Hero locale="en" /><ScrollFilm locale="en" members={members} /><BlogInvitation locale="en" /><CtaSection locale="en" /></>;
}
