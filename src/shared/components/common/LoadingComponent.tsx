export default function LoadingComponent() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-spacing-400"
      role="status"
      aria-live="polite">
      <div
        className="h-12 w-12 animate-spin rounded-full border-core-accent border-t-2 border-b-2"
        aria-hidden="true"
      />
      <span className="text-content-standard-tertiary text-label">로딩중...</span>
    </div>
  );
}
