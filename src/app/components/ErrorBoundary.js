"use client";

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-lg w-full text-center">
            <h1 className="text-4xl mb-4">💥</h1>
            <h2 className="text-xl font-bold mb-4 text-red-400">Oops, something went wrong.</h2>
            <p className="text-gray-400 mb-6 text-sm">
              An unexpected error occurred in this section of the portal. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold transition-all"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-left bg-black/50 p-4 rounded-xl overflow-auto text-xs text-red-300">
                <pre>{this.state.error?.toString()}</pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
