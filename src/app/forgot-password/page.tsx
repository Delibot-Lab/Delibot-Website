import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
};

export default function ForgotPasswordPage() {
  return (
    <section className="bg-bg py-24">
      <Container className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-muted">
            가입한 이메일로 비밀번호 재설정 링크를 보내드려요.
          </p>
        </div>
        <ForgotPasswordForm />
      </Container>
    </section>
  );
}
