import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
};

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center bg-bg py-24">
      <Container className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-semibold text-mint-strong">404</p>
        <h1 className="text-2xl font-bold text-navy">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="max-w-sm text-sm text-muted">
          주소가 잘못되었거나, 페이지가 이동 또는 삭제되었어요.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            홈으로
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface"
          >
            블로그 보기
          </Link>
        </div>
      </Container>
    </section>
  );
}
