export default function LoadingComponent() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-spacing-400"
      role="status"
      aria-live="polite">
      <div className="relative size-12" aria-hidden="true">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-core-accent border-t-transparent" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-core-accent/30 border-b-transparent [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      <span className="text-content-standard-tertiary text-label">로딩중...</span>
    </div>
  );
}
