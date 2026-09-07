import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            boxSizing: "border-box",
            background: "#f9fafb",
            color: "#191f28",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22 }}>앱을 불러오지 못했어요</h1>
          <p style={{ margin: 0, color: "#6b7684", lineHeight: 1.5 }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              marginTop: 8,
              minWidth: 120,
              minHeight: 48,
              border: 0,
              borderRadius: 12,
              background: "#3182f6",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            다시 시도하기
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
