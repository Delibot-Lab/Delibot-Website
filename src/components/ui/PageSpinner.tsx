export function PageSpinner({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-mint-strong"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
