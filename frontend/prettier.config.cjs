module.exports = {
  importOrder: [
    "<THIRD_PARTY_MODULES>'",
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 110,
  tailwindFunctions: ["cva"],
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
};
