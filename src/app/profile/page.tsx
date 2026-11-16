import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { apiFetch, getCurrentUser } from "@/lib/api-server";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import { PublicProfileEditor } from "@/components/profile/PublicProfileEditor";
import type { TeamProfile } from "@/lib/team";

export const metadata: Metadata = {
  title: "내 프로필",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const response = await apiFetch("/api/v1/profile");
  if (!response.ok) notFound();
  const profile = await response.json() as {
    name: string; birthday: string; avatar_url: string | null;
  } & Partial<TeamProfile>;
  const publicProfile = profile.slug ? profile as TeamProfile : null;

  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-4xl">
        <h1 className="mb-8 text-center text-2xl font-bold text-navy">내 프로필</h1>
        <Card tone="surface" className="mx-auto flex max-w-md flex-col items-center gap-6">
          <AvatarUploader
            name={profile.name}
            initialAvatarUrl={profile.avatar_url}
          />
          <div className="w-full space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted">이름</span>
              <span className="font-medium text-navy">{profile.name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted">이메일</span>
              <span className="font-medium text-navy">{user.email}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted">생년월일</span>
              <span className="font-medium text-navy">{profile.birthday}</span>
            </div>
          </div>
          <DeleteAccountButton />
        </Card>
        <PublicProfileEditor name={profile.name} email={user.email} initial={publicProfile} />
      </Container>
    </section>
  );
}
