import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "legacy/fetch",
  input: "http://localhost:8000/api/openapi.json",
  output: { path: "services" },
  experimentalParser: true,
  plugins: [
    {
      name: "@hey-api/typescript",
      enums: "javascript",
    },
    {
      name: "@hey-api/sdk",
      asClass: true,
      operationId: true,
    },
    "zod",
  ],
});
