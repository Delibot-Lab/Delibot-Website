import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <section className="bg-bg py-24">
      <Container className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-navy">회원가입</h1>
        <SignupForm />
      </Container>
    </section>
  );
}
