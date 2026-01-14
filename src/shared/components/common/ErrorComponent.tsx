interface ErrorComponentProps {
  errorMessage: string;
}

export default function ErrorComponent({ errorMessage }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-spacing-400">
      <svg className="h-12 w-12 text-core-status-negative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="text-center text-content-standard-tertiary text-label">
        문제가 발생했습니다
        <br />
        {errorMessage}
      </span>
    </div>
  );
}
