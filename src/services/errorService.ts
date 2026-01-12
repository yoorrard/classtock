// Error logging service
// Can be extended to integrate with services like Sentry, LogRocket, etc.

interface ErrorContext {
    componentStack?: string;
    type?: string;
    userId?: string;
    additionalInfo?: Record<string, unknown>;
}

interface ErrorLog {
    timestamp: number;
    message: string;
    stack?: string;
    context: ErrorContext;
    url: string;
    userAgent: string;
}

// In-memory error log (for development/debugging)
const errorLogs: ErrorLog[] = [];
const MAX_LOGS = 100;

/**
 * Log an error with context
 */
export function logError(error: Error, context: ErrorContext = {}): void {
    const errorLog: ErrorLog = {
        timestamp: Date.now(),
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
    };

    // Store in memory (circular buffer)
    errorLogs.push(errorLog);
    if (errorLogs.length > MAX_LOGS) {
        errorLogs.shift();
    }

    // Console log in development
    if (import.meta.env.DEV) {
        console.group('🚨 Error Logged');
        console.error('Error:', error);
        console.log('Context:', context);
        console.groupEnd();
    }

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
        sendToErrorService(errorLog);
    }
}

/**
 * Log a warning
 */
export function logWarning(message: string, context: Record<string, unknown> = {}): void {
    if (import.meta.env.DEV) {
        console.warn('⚠️ Warning:', message, context);
    }
}

/**
 * Log an info message
 */
export function logInfo(message: string, context: Record<string, unknown> = {}): void {
    if (import.meta.env.DEV) {
        console.info('ℹ️ Info:', message, context);
    }
}

/**
 * Get recent error logs (for debugging)
 */
export function getErrorLogs(): ErrorLog[] {
    return [...errorLogs];
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
    errorLogs.length = 0;
}

/**
 * Send error to external service
 * Placeholder for integration with Sentry, LogRocket, etc.
 */
async function sendToErrorService(errorLog: ErrorLog): Promise<void> {
    // TODO: Integrate with error tracking service
    // Example with Sentry:
    // Sentry.captureException(new Error(errorLog.message), {
    //     extra: errorLog.context,
    // });

    // For now, we'll store errors in localStorage as a fallback
    try {
        const storedErrors = JSON.parse(localStorage.getItem('classstock_errors') || '[]');
        storedErrors.push({
            ...errorLog,
            // Truncate stack to save space
            stack: errorLog.stack?.slice(0, 500),
        });

        // Keep only last 20 errors
        if (storedErrors.length > 20) {
            storedErrors.splice(0, storedErrors.length - 20);
        }

        localStorage.setItem('classstock_errors', JSON.stringify(storedErrors));
    } catch {
        // Ignore localStorage errors
    }
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandler(): void {
    // Handle uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
        logError(error || new Error(String(message)), {
            type: 'uncaught_error',
            additionalInfo: { source, lineno, colno },
        });
        return false; // Don't prevent default handling
    };

    // Handle unhandled promise rejections
    window.onunhandledrejection = (event) => {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));

        logError(error, {
            type: 'unhandled_rejection',
        });
    };
}

/**
 * Performance monitoring
 */
export function logPerformance(metric: string, duration: number, context: Record<string, unknown> = {}): void {
    if (import.meta.env.DEV) {
        console.log(`⏱️ Performance [${metric}]: ${duration.toFixed(2)}ms`, context);
    }

    // In production, could send to analytics
    if (import.meta.env.PROD && duration > 3000) {
        // Log slow operations
        logWarning(`Slow operation: ${metric}`, { duration, ...context });
    }
}
