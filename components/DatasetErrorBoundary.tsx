"use client";

import { ErrorPage } from "@/components/error-page";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for dataset loading failures
 * Catches errors from dataset operations and shows user-friendly fallback
 */
export class DatasetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Dataset loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          title="Data Loading Error"
          message="We couldn't load the required data. Please try refreshing the page."
          statusCode={500}
          language="en"
        />
      );
    }

    return this.props.children;
  }
}
