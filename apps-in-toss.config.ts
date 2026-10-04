import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "howmuchmoney",
  brand: { primaryColor: "#3182F6" },
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    theme: "light",
  },
  webView: {},
  permissions: [],
  webBundleDir: "dist",
});
