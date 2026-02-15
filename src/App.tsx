import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { MainPage } from "@/pages/MainPage";

function App() {
  return (
    <ErrorBoundary>
      <MainPage />
    </ErrorBoundary>
  );
}

export default App;
