import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `내 프로필 | ${siteConfig.name}`,
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, birthday, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) notFound();

  return (
    <section className="bg-bg py-16 md:py-24">
      <Container className="max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-navy">내 프로필</h1>
        <Card tone="surface" className="flex flex-col items-center gap-6">
          <AvatarUploader
            userId={user.id}
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
        </Card>
      </Container>
    </section>
  );
}
