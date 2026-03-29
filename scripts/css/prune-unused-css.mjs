import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { PurgeCSS } from "purgecss";

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");
const aggressive = args.includes("--aggressive");
const ultra = args.includes("--ultra");
const reportFlagIndex = args.indexOf("--report");
const reportPathArg =
  reportFlagIndex >= 0 && args[reportFlagIndex + 1]
    ? args[reportFlagIndex + 1]
    : null;

const root = process.cwd();
const srcDir = path.join(root, "src");
const stylesDir = path.join(srcDir, "styles");
const EXCLUDED_STYLE_FILES = new Set([
  path.normalize(path.join(stylesDir, "widgets", "google-calendar.css")),
]);

const CONTENT_EXTENSIONS = new Set([
  ".astro",
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
  ".md",
  ".mdx",
  ".html",
]);

const STATIC_SAFELIST = new Set([
  "dark",
  "light",
  "loading",
  "loaded",
  "open",
  "hidden",
  "visible",
  "active",
  "inactive",
  "online",
  "offline",
  "reveal-animated",
  "lazy-loaded",
  "scroll-locked",
  "is-open",
  "is-hidden",
  "is-active",
  "dropdown-open",
  "services-modal-open",
  "dropdown-right-aligned",
  "scrollable-top",
  "scrollable-bottom",
  "nav-scrolled",
  ":global([data-google-calendar-open])",
  ":global([data-google-calendar-open]:focus-visible)",
  ":global(a[data-google-calendar-open])",
  ":global(button[data-google-calendar-open])",
]);

const GREEDY_SAFELIST = [
  /^auxo-/,
  /^theme-/,
  /^bg-theme/,
  /^text-theme/,
  /^border-theme/,
  /google-calendar-open/,
];

const DEEP_SAFELIST = [/data-google-calendar-open/];

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath)));
      continue;
    }
    results.push(fullPath);
  }

  return results;
}

function extractQuotedStrings(value) {
  const classNames = [];
  const quotedValueRegex = /['"`]([A-Za-z0-9_-]+)['"`]/g;
  let match;
  while ((match = quotedValueRegex.exec(value)) !== null) {
    classNames.push(match[1]);
  }
  return classNames;
}

function extractDynamicClassNames(content) {
  const names = new Set();

  const classListRegex =
    /classList\.(?:add|remove|toggle|contains)\(([^)]+)\)/g;
  let classListMatch;
  while ((classListMatch = classListRegex.exec(content)) !== null) {
    for (const name of extractQuotedStrings(classListMatch[1])) {
      names.add(name);
    }
  }

  const classNameAssignRegex = /className\s*=\s*([^\n;]+)/g;
  let classNameAssignMatch;
  while ((classNameAssignMatch = classNameAssignRegex.exec(content)) !== null) {
    for (const name of extractQuotedStrings(classNameAssignMatch[1])) {
      names.add(name);
    }
  }

  const datasetRegex = /dataset\.([A-Za-z0-9_]+)/g;
  let datasetMatch;
  while ((datasetMatch = datasetRegex.exec(content)) !== null) {
    names.add(datasetMatch[1]);
  }

  return names;
}

async function main() {
  const allSourceFiles = await walkFiles(srcDir);
  const styleFiles = allSourceFiles.filter((file) =>
    file.startsWith(stylesDir + path.sep),
  );
  const contentFiles = allSourceFiles.filter((file) =>
    CONTENT_EXTENSIONS.has(path.extname(file)),
  );

  const safelist = new Set(STATIC_SAFELIST);
  for (const file of contentFiles) {
    const text = await fs.readFile(file, "utf8");
    const dynamicNames = extractDynamicClassNames(text);
    for (const name of dynamicNames) safelist.add(name);
  }

  const report = [];
  let totalBefore = 0;
  let totalAfter = 0;
  let changedFiles = 0;
  let removedSelectors = 0;

  for (const file of styleFiles) {
    if (EXCLUDED_STYLE_FILES.has(path.normalize(file))) {
      const before = await fs.readFile(file, "utf8");
      totalBefore += before.length;
      totalAfter += before.length;
      report.push({
        file: path.relative(root, file),
        beforeBytes: before.length,
        afterBytes: before.length,
        removedBytes: 0,
        removedSelectors: [],
      });
      continue;
    }

    const before = await fs.readFile(file, "utf8");
    const [result] = await new PurgeCSS().purge({
      content: contentFiles,
      css: [{ raw: before }],
      defaultExtractor: (content) =>
        content.match(/[\w-/:%.]+(?<!:)/g) || [],
      safelist: {
        standard: [...safelist],
        deep: DEEP_SAFELIST,
        greedy: GREEDY_SAFELIST,
      },
      keyframes: aggressive || ultra,
      fontFace: ultra,
      variables: ultra,
      rejected: true,
    });
    const after = result?.css ?? "";

    totalBefore += before.length;
    totalAfter += after.length;
    removedSelectors += result?.rejected?.length ?? 0;

    if (before !== after) {
      changedFiles += 1;
      if (shouldWrite) {
        await fs.writeFile(file, after, "utf8");
      }
    }

    report.push({
      file: path.relative(root, file),
      beforeBytes: before.length,
      afterBytes: after.length,
      removedBytes: before.length - after.length,
      removedSelectors: result?.rejected ?? [],
    });
  }

  report.sort((a, b) => b.removedBytes - a.removedBytes);

  const summary = {
    mode: shouldWrite ? "write" : "dry-run",
    aggressive,
    ultra,
    filesAnalyzed: styleFiles.length,
    filesChanged: changedFiles,
    beforeBytes: totalBefore,
    afterBytes: totalAfter,
    bytesRemoved: totalBefore - totalAfter,
    selectorsRemoved: removedSelectors,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log("Top 10 files by removed bytes:");
  for (const item of report.slice(0, 10)) {
    if (item.removedBytes <= 0) continue;
    console.log(
      `- ${item.file}: -${item.removedBytes} bytes (${item.removedSelectors.length} selectors)`,
    );
  }

  if (reportPathArg) {
    const reportPath = path.isAbsolute(reportPathArg)
      ? reportPathArg
      : path.join(root, reportPathArg);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(
      reportPath,
      JSON.stringify({ summary, files: report }, null, 2),
      "utf8",
    );
    console.log(`Report written to ${path.relative(root, reportPath)}`);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
