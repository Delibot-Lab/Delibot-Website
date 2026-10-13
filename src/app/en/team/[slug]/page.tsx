import type { Metadata } from "next";
import { TeamProfileView } from "@/components/profile/TeamProfileView";

export const metadata: Metadata = { title: "Team Profile" };

export default async function EnglishTeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamProfileView slug={slug} locale="en" />;
}
