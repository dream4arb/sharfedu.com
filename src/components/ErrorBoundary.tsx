import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

const REACT_ERROR_CODES: Record<string, string> = {
  "321": "Invalid hook call — هذا يعني استدعاء Hook خارج مكوّن React أو وجود أكثر من نسخة React",
  "31": "Objects are not valid as a React child — محاولة عرض كائن كنص في الصفحة",
  "130": "Element type is invalid — نوع العنصر غير صحيح",
  "152": "Nothing was returned from render — المكوّن لم يرجع شيئاً",
};

function decodeMinifiedError(message: string): string | null {
  const match = message.match(/Minified React error #(\d+)/);
  if (match) {
    return REACT_ERROR_CODES[match[1]] || `React Error #${match[1]}`;
  }
  return null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ errorInfo: info });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      const msg = this.state.error?.message || "خطأ غير معروف";
      const decoded = decodeMinifiedError(msg);
      const stack = this.state.error?.stack || "";
      const componentStack = this.state.errorInfo?.componentStack || "";

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background" dir="rtl">
          <h2 className="text-xl font-bold text-destructive mb-2">حدث خطأ</h2>
          {decoded && (
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 text-center max-w-lg">
              {decoded}
            </p>
          )}
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {msg}
          </p>
          <details className="mb-4 w-full max-w-2xl text-xs text-left" dir="ltr">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
              Error Stack Trace (click to expand)
            </summary>
            <pre className="bg-muted p-3 rounded-lg overflow-auto max-h-60 whitespace-pre-wrap break-all text-[11px]">
              {stack}
            </pre>
            {componentStack && (
              <>
                <p className="mt-2 font-semibold text-muted-foreground">Component Stack:</p>
                <pre className="bg-muted p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-all text-[11px]">
                  {componentStack}
                </pre>
              </>
            )}
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="mt-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent"
          >
            العودة للرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
