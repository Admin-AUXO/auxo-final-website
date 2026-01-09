import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (import.meta.env.PROD && typeof window !== 'undefined') {
      import('@/scripts/analytics/ga4').then(({ trackError }) => {
        trackError({
          errorMessage: error.message,
          errorType: error.name || 'ErrorBoundary',
          fatal: false,
          location: window.location.pathname,
        });
      }).catch(() => {});
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="p-4 rounded-lg bg-theme-card border-2 border-red-500/20 text-theme-primary"
        >
          <h2 className="text-lg font-bold mb-2 text-red-500">Something went wrong</h2>
          <p className="text-sm text-theme-secondary">
            {import.meta.env.DEV && this.state.error
              ? this.state.error.message
              : 'An error occurred. Please try refreshing the page.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
