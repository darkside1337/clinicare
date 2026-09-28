import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FEATURES = [
  "appointments",
  "clinics",
  "consultations",
  "patients",
  "prescriptions",
];

const ALLOWED_CROSS_FEATURE_DEPS = {
  patients: ["appointments", "consultations", "prescriptions"],
  consultations: ["prescriptions"],
  appointments: [],
  clinics: [],
  prescriptions: [],
};

const featureBoundaryConfigs = FEATURES.map((feature) => {
  const allowed = ALLOWED_CROSS_FEATURE_DEPS[feature] || [];
  const otherFeatures = FEATURES.filter((f) => f !== feature);

  const patterns = [];

  for (const other of otherFeatures) {
    if (allowed.includes(other)) {
      patterns.push({
        group: [
          `@/features/${other}/components`,
          `@/features/${other}/components/**`,
          `@/features/${other}/mutations`,
          `@/features/${other}/mutations/**`,
          `@/features/${other}/pdf`,
          `@/features/${other}/pdf/**`,
        ],
        message: `Forbidden cross-feature import: "${feature}" cannot import components, mutations, or pdf from "${other}".`,
      });
    } else {
      patterns.push({
        group: [
          `@/features/${other}`,
          `@/features/${other}/**`,
        ],
        message: `Forbidden cross-feature import: "${feature}" cannot import from "${other}".`,
      });
    }
  }

  return {
    files: [`features/${feature}/**`],
    ignores: ["**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns,
        },
      ],
    },
  };
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  ...featureBoundaryConfigs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
