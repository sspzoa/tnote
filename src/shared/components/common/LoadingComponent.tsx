const LoadingComponent = () => {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-spacing-400"
      role="status"
      aria-live="polite">
      <div className="relative size-12" aria-hidden="true">
        <div className="absolute top-0 right-0 bottom-0 left-0 animate-spin rounded-full border-2 border-core-accent border-t-solid-transparent" />
        <div className="absolute top-2 right-2 bottom-2 left-2 animate-spin rounded-full border-2 border-core-accent/30 border-b-solid-transparent [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      <span className="text-content-standard-tertiary text-label">로딩중...</span>
    </div>
  );
};

export default LoadingComponent;
