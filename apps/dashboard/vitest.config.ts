import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/astehub/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost" },
    },
    setupFiles: ["./test/setup.ts"],
    include: ["test/unit/**/*.test.tsx"],
    restoreMocks: true,
  },
});
