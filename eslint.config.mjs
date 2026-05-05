import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "prisma/generated/**",
      "src/generated/**",
      "*.config.js",
      "*.config.ts",
    ],
  },
  ...nextCoreWebVitals,
];

export default config;
