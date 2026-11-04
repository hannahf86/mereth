import { defineConfig } from "vitest/config";

// Domain/unit tests (eligibility, scheduling, fees, theming) run in Node.
// Playwright E2E lives separately under tests/e2e and is not picked up here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
