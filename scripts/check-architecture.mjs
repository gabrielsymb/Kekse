import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function filesUnder(path) {
  return readdirSync(path)
    .flatMap((name) => {
      const target = join(path, name);
      return statSync(target).isDirectory() ? filesUnder(target) : [target];
    })
    .filter((file) => /\.[jt]sx?$/.test(file));
}

const uiFiles = [
  join(root, "src/Prototype.tsx"),
  ...filesUnder(join(root, "src/screens")),
  ...filesUnder(join(root, "src/components")),
];
const forbiddenUiImports = [
  "ts-fsrs",
  "@cortex-js/compute-engine",
  "/sympy",
  "learning/equivalence",
  "learning/generators",
  "learning/model",
  "learning/persistence",
];

const violations = [];
for (const file of uiFiles) {
  const source = readFileSync(file, "utf8");
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  for (const forbidden of forbiddenUiImports) {
    if (
      imports.some(
        (specifier) => specifier === forbidden || specifier.includes(forbidden),
      )
    ) {
      violations.push(
        `${relative(root, file)} imports forbidden motor module: ${forbidden}`,
      );
    }
  }
}

for (const file of filesUnder(join(root, "src/learning"))) {
  const source = readFileSync(file, "utf8");
  if (/from\s+["'][^"']*(screens|components|prototype\.css)/.test(source)) {
    violations.push(`${relative(root, file)} imports an interface module`);
  }
}

if (violations.length) {
  console.error(
    "Architecture boundary check failed:\n" +
      violations.map((item) => `- ${item}`).join("\n"),
  );
  process.exit(1);
}

console.log(`Architecture boundary check passed (${uiFiles.length} UI files).`);
