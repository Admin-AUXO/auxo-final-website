import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const scanDir = path.join(root, "src");
const decorativeHints = [
  "backdrop",
  "particle",
  "layout-shift-fix",
  "section-gradient",
  "section-pattern",
  "accent-lines",
  "cta-bg",
  "team-gradient",
  "team-accent-bars",
  "partnership-",
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (path.extname(entry.name) === ".astro") {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function collectMatches(filePath, source) {
  const matches = [];
  const classRegex = /class\s*=\s*(["'`])([\s\S]*?)\1/gm;
  let match;

  while ((match = classRegex.exec(source)) !== null) {
    const classValue = match[2].replace(/\s+/g, " ").trim();
    if (
      !/(?:absolute|fixed)/.test(classValue) ||
      !/\binset-0\b/.test(classValue) ||
      !/\bz-0\b/.test(classValue)
    ) {
      continue;
    }

    if (!decorativeHints.some((hint) => classValue.includes(hint))) {
      continue;
    }

    matches.push({
      file: path.relative(root, filePath),
      line: getLineNumber(source, match.index),
      message: "Decorative full-bleed layer still uses `z-0`",
      excerpt: classValue.length > 110 ? `${classValue.slice(0, 107)}...` : classValue,
    });
  }

  return matches;
}

async function main() {
  const files = await walk(scanDir);
  const findings = [];

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    findings.push(...collectMatches(file, source));
  }

  if (findings.length === 0) {
    console.log("stacking audit: 0 candidate issues");
    return;
  }

  const grouped = new Map();
  for (const finding of findings) {
    const group = grouped.get(finding.file) ?? [];
    group.push(finding);
    grouped.set(finding.file, group);
  }

  console.log(
    `stacking audit: ${findings.length} candidate issue${findings.length === 1 ? "" : "s"} in ${grouped.size} file${grouped.size === 1 ? "" : "s"}`,
  );

  for (const [file, fileFindings] of [...grouped.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(`- ${file} (${fileFindings.length})`);
    for (const finding of fileFindings.slice(0, 3)) {
      console.log(`  L${finding.line}: ${finding.message}`);
      console.log(`    ${finding.excerpt}`);
    }
    if (fileFindings.length > 3) {
      console.log(`  ... ${fileFindings.length - 3} more`);
    }
  }

  process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
