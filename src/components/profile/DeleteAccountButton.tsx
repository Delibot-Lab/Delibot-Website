"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useConfirmDialog } from "@/components/ui/ConfirmDialogProvider";

export function DeleteAccountButton() {
  const router = useRouter();
  const confirmDialog = useConfirmDialog();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = await confirmDialog({
      title: "계정을 삭제할까요?",
      description:
        "프로필, 지원서, 채팅 기록을 포함한 모든 정보가 영구히 삭제돼요. 이 작업은 되돌릴 수 없어요.",
      confirmLabel: "계정 삭제",
      danger: true,
    });
    if (!ok) return;

    setError(null);
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("delete_own_account");
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full border-t border-border pt-4 text-center">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs font-medium text-danger hover:underline disabled:opacity-60"
      >
        {deleting ? "삭제 중..." : "계정 삭제"}
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
