"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-7">
          <div className="text-center">
            <h2 className="mb-2 font-bold text-foreground text-xl">문제가 발생했습니다</h2>
            <p className="text-base text-muted-foreground">
              예기치 않은 오류가 발생했습니다. 페이지를 새로고침 해주세요.
            </p>
            {this.state.error && <p className="mt-2 text-muted-foreground text-xs">{this.state.error.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-md bg-primary px-5 py-3 font-medium text-sm text-primary-foreground transition-opacity hover:opacity-90">
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
