import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <section className="bg-bg py-24">
      <Container className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-navy">로그인</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Container>
    </section>
  );
}
