"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmDialogContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(
  null
);

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function close(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  // 모달이 떠 있는 동안 배경 스크롤을 막는다 (특히 모바일에서 뒤 콘텐츠가 같이 밀리는 걸 방지).
  useEffect(() => {
    if (!pending) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [pending]);

  // 다이얼로그 안의 취소/확인 버튼 사이에서만 Tab이 순환하도록 포커스를 가둔다.
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const first = cancelBtnRef.current;
    const last = confirmBtnRef.current;
    if (!first || !last) return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 px-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby={pending.description ? "confirm-dialog-description" : undefined}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") close(false);
              trapFocus(e);
            }}
            className="w-full max-w-sm rounded-2xl border border-border bg-bg p-5 shadow-xl"
          >
            <h2 id="confirm-dialog-title" className="text-base font-bold text-navy">
              {pending.title}
            </h2>
            {pending.description && (
              <p id="confirm-dialog-description" className="mt-2 text-sm text-muted">
                {pending.description}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => close(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-surface"
              >
                {pending.cancelLabel ?? "취소"}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] ${
                  pending.danger ? "bg-danger" : "bg-navy"
                }`}
              >
                {pending.confirmLabel ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}
