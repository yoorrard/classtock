import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../../services/errorService';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log the error
        logError(error, {
            componentStack: errorInfo.componentStack || '',
            type: 'react_error_boundary',
        });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
                        오류가 발생했습니다
                    </h2>
                    <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '400px' }}>
                        예기치 않은 오류가 발생했습니다. 문제가 지속되면 관리자에게 문의해주세요.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={this.handleRetry}
                            className="button"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="button button-secondary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            페이지 새로고침
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
                            <summary style={{ cursor: 'pointer', color: '#666' }}>
                                개발자 정보
                            </summary>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.875rem',
                            }}>
                                {this.state.error.toString()}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
