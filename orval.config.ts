import { defineConfig } from "orval";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-reprieve-dev.nysm.work";

const openApiSpecUrl =
  process.env.ORVAL_INPUT ?? "https://api-reprieve-dev.nysm.work/docs-json";

export default defineConfig({
  api: {
    input: {
      target: openApiSpecUrl,
    },
    output: {
      mode: "split",
      target: "src/services/queries.ts",
      schemas: "src/services/models",
      client: "react-query",
      override: {
        mutator: {
          path: "src/services/custom-client.ts",
          name: "customClient",
        },
      },
    },
  },
});
