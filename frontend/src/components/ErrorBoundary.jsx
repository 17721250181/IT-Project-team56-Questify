import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }

        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="container mt-5">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card border-danger">
                                <div className="card-header bg-danger text-white">
                                    <h4 className="mb-0">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        Something went wrong
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <p className="mb-3">
                                        We're sorry, but something unexpected happened. 
                                        The error has been logged and we'll look into it.
                                    </p>
                                    
                                    {import.meta.env.DEV && this.state.error && (
                                        <div className="alert alert-warning">
                                            <h6 className="alert-heading">Development Error Details:</h6>
                                            <p className="mb-2">
                                                <strong>Error:</strong> {this.state.error.toString()}
                                            </p>
                                            {this.state.errorInfo && (
                                                <details className="mt-2">
                                                    <summary style={{ cursor: 'pointer' }}>
                                                        Stack Trace
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-light" style={{ fontSize: '0.85em' }}>
                                                        {this.state.errorInfo.componentStack}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={this.handleReset}
                                        >
                                            <i className="bi bi-arrow-clockwise me-2"></i>
                                            Try Again
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => window.location.href = '/'}
                                        >
                                            <i className="bi bi-house me-2"></i>
                                            Go Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
