import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import App from "@/App";

export default function AppBootstrap() {
  return (
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  );
}
