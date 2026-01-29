import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "howmuch-money",
  brand: {
    displayName: "얼마냈지",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/17227/e6c265d0-b517-44d1-8d5e-66e394617883.png",
  },
  navigationBar: {
    withBackButton: false, // 메인 페이지이므로 뒤로가기 버튼 불필요
    withHomeButton: false, // 홈 버튼 불필요
  },
  web: {
    host: "192.168.0.40",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "tsc -b && vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
