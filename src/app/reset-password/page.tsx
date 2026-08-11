import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="bg-bg py-24">
      <Container className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-navy">비밀번호 재설정</h1>
        <ResetPasswordForm />
      </Container>
    </section>
  );
}
