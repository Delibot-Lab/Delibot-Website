import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/blog/LoginForm";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `관리자 로그인 | ${siteConfig.name}`,
};

export default function LoginPage() {
  return (
    <section className="bg-bg py-24">
      <Container className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-navy">관리자 로그인</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </Container>
    </section>
  );
}
