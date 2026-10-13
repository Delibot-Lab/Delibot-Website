import type { Metadata } from "next";
import { TeamProfileView } from "@/components/profile/TeamProfileView";

export const metadata: Metadata = { title: "팀원 프로필" };

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamProfileView slug={slug} />;
}
