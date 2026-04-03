import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");

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

function splitTopLevelCommaList(value) {
  const parts = [];
  let current = "";
  let depth = 0;

  for (const character of value) {
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;

    if (character === "," && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function extractImportedNames(importClause) {
  const identifiers = [];

  for (const part of splitTopLevelCommaList(importClause)) {
    if (part.startsWith("{") && part.endsWith("}")) {
      const names = part
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      for (const name of names) {
        const localName = name.split(/\s+as\s+/i).pop()?.trim();
        if (localName) identifiers.push(localName);
      }
      continue;
    }

    if (part.startsWith("* as ")) {
      const localName = part.slice(5).trim();
      if (localName) identifiers.push(localName);
      continue;
    }

    identifiers.push(part);
  }

  return identifiers.filter((identifier) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(identifier));
}

function collectIssues(filePath, source) {
  const issues = [];
  const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return issues;

  const frontmatter = frontmatterMatch[1];
  const importRegex = /^\s*import\s+(type\s+)?(.+?)\s+from\s+["'][^"']+["'];?\s*$/gm;
  const searchArea = frontmatter.replace(importRegex, "") + source.slice(frontmatterMatch[0].length);

  let importMatch;
  while ((importMatch = importRegex.exec(frontmatter)) !== null) {
    const isTypeOnly = Boolean(importMatch[1]);
    if (isTypeOnly) continue;

    const importClause = importMatch[2].trim();
    for (const identifier of extractImportedNames(importClause)) {
      const usageRegex = new RegExp(`\\b${identifier}\\b`, "g");
      if (!usageRegex.test(searchArea)) {
        issues.push({
          file: path.relative(root, filePath),
          line: getLineNumber(source, frontmatterMatch.index + importMatch.index),
          message: `Unused Astro import: \`${identifier}\``,
        });
      }
    }
  }

  const anyCastRegex = /\bas\s+any\b/g;
  let anyCastMatch;
  while ((anyCastMatch = anyCastRegex.exec(source)) !== null) {
    issues.push({
      file: path.relative(root, filePath),
      line: getLineNumber(source, anyCastMatch.index),
      message: "Avoid `as any` in Astro files",
    });
  }

  return issues;
}

async function main() {
  const files = await walk(srcDir);
  const issues = [];

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    issues.push(...collectIssues(file, source));
  }

  if (issues.length === 0) {
    console.log("astro audit: 0 issues");
    return;
  }

  const grouped = new Map();
  for (const issue of issues) {
    const list = grouped.get(issue.file) ?? [];
    list.push(issue);
    grouped.set(issue.file, list);
  }

  console.log(
    `astro audit: ${issues.length} issue${issues.length === 1 ? "" : "s"} in ${grouped.size} file${grouped.size === 1 ? "" : "s"}`,
  );

  for (const [file, fileIssues] of [...grouped.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(`- ${file} (${fileIssues.length})`);
    for (const issue of fileIssues.slice(0, 5)) {
      console.log(`  L${issue.line}: ${issue.message}`);
    }
    if (fileIssues.length > 5) {
      console.log(`  ... ${fileIssues.length - 5} more`);
    }
  }

  process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
