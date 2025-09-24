import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetType?: string;
  widgetId?: string;
  onRetry?: () => void;
  onRemove?: () => void;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring (you can replace this with your error reporting service)
    console.error('Widget Error Boundary caught an error:', {
      widgetType: this.props.widgetType,
      widgetId: this.props.widgetId,
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  handleRemove = () => {
    if (this.props.onRemove) {
      this.props.onRemove();
    }
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="AlertTriangle" className="w-6 h-6 text-red-400" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Widget Error</h3>

          <p className="text-gray-400 text-sm mb-4 max-w-xs">
            {this.props.widgetType ? `The ${this.props.widgetType} widget` : 'This widget'}
            {' '}encountered an error and couldn't load properly.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-3 bg-gray-800/50 rounded-lg text-left w-full max-w-sm">
              <summary className="text-xs text-gray-400 cursor-pointer mb-2">
                Error Details (Dev Mode)
              </summary>
              <div className="text-xs text-red-300 font-mono break-all">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="text-xs opacity-75">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex items-center space-x-3">
            {canRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
              >
                <Icon name="RotateCcw" className="w-4 h-4" />
                <span>Retry ({this.maxRetries - this.state.retryCount} left)</span>
              </motion.button>
            )}

            {this.props.onRemove && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRemove}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
              >
                <Icon name="X" className="w-4 h-4" />
                <span>Remove</span>
              </motion.button>
            )}
          </div>

          {!canRetry && (
            <p className="text-xs text-gray-500 mt-3">
              Maximum retry attempts reached. Try removing and re-adding this widget.
            </p>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;