import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BootScreen } from "@/components/common/BootScreen";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./index.css";

const AppBootstrap = lazy(() => import("@/AppBootstrap"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<BootScreen />}>
        <AppBootstrap />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
