import React from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import Button from '../ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="mb-4 text-error">
            <HiExclamationTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-neutral-400 max-w-md mb-2">
            An unexpected error occurred. Please try again.
          </p>
          {this.state.error && (
            <p className="text-xs text-neutral-300 max-w-md mb-6 font-mono bg-neutral-50 px-4 py-2 rounded-lg">
              {this.state.error.message}
            </p>
          )}
          <Button variant="primary" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
