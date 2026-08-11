"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center bg-bg py-24">
      <Container className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-semibold text-danger">오류 발생</p>
        <h1 className="text-2xl font-bold text-navy">
          일시적인 문제가 발생했어요
        </h1>
        <p className="max-w-sm text-sm text-muted">
          페이지를 불러오는 중 오류가 생겼습니다. 다시 시도해보시고, 계속되면
          알려주세요.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface"
          >
            홈으로
          </Link>
        </div>
      </Container>
    </section>
  );
}
