import { Component, type ReactNode } from "react";
import { GlobalErrorView } from "./GlobalErrorView";

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
        <GlobalErrorView
          title="문제가 발생했습니다"
          description="앱에서 예기치 않은 오류가 발생했어요. 다시 시도해주세요."
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
