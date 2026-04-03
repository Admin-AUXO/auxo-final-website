import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const configFile = path.join(srcDir, "scripts", "utils", "carousels.ts");

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

function collectCarouselCallsites(filePath, source) {
  const callsites = [];
  const carouselTagRegex = /<Carousel\b([\s\S]*?)>/gm;
  let match;

  while ((match = carouselTagRegex.exec(source)) !== null) {
    const rawProps = match[1];
    const containerId = rawProps.match(/\bcontainerId\s*=\s*"([^"]+)"/)?.[1] ?? null;
    const trackId = rawProps.match(/\btrackId\s*=\s*"([^"]+)"/)?.[1] ?? null;
    const alwaysVisible = /\balwaysVisible\s*=\s*\{true\}/.test(rawProps);

    callsites.push({
      file: path.relative(root, filePath),
      line: getLineNumber(source, match.index),
      containerId,
      trackId,
      alwaysVisible,
      hasEmblaSlideClass: source.includes("embla__slide"),
    });
  }

  return callsites;
}

async function main() {
  const astroFiles = await walk(srcDir);
  const callsites = [];

  for (const file of astroFiles) {
    const source = await fs.readFile(file, "utf8");
    callsites.push(...collectCarouselCallsites(file, source));
  }

  const configSource = await fs.readFile(configFile, "utf8");
  const configContainerIds = [...configSource.matchAll(/containerId:\s*"([^"]+)"/g)].map(
    (match) => match[1],
  );

  const issues = [];
  const callsitesByContainer = new Map();

  for (const callsite of callsites) {
    if (!callsite.containerId) {
      issues.push({
        file: callsite.file,
        line: callsite.line,
        message: "`<Carousel>` is missing `containerId`",
      });
      continue;
    }

    if (!callsite.trackId) {
      issues.push({
        file: callsite.file,
        line: callsite.line,
        message: `Carousel \`${callsite.containerId}\` is missing \`trackId\``,
      });
    }

    if (!callsite.hasEmblaSlideClass) {
      issues.push({
        file: callsite.file,
        line: callsite.line,
        message: `Carousel \`${callsite.containerId}\` has no \`.embla__slide\` usage in file`,
      });
    }

    const sameFileIds = callsitesByContainer.get(callsite.file) ?? new Set();
    if (sameFileIds.has(callsite.containerId)) {
      issues.push({
        file: callsite.file,
        line: callsite.line,
        message: `Duplicate carousel container id in file: \`${callsite.containerId}\``,
      });
    }
    sameFileIds.add(callsite.containerId);
    callsitesByContainer.set(callsite.file, sameFileIds);
  }

  const callsiteContainerIds = new Set(
    callsites.map((callsite) => callsite.containerId).filter(Boolean),
  );

  for (const containerId of callsiteContainerIds) {
    if (!configContainerIds.includes(containerId)) {
      issues.push({
        file: path.relative(root, configFile),
        line: 1,
        message: `Missing carousel runtime config for \`${containerId}\``,
      });
    }
  }

  for (const containerId of configContainerIds) {
    if (!callsiteContainerIds.has(containerId)) {
      issues.push({
        file: path.relative(root, configFile),
        line: getLineNumber(configSource, configSource.indexOf(`"${containerId}"`)),
        message: `Unused carousel runtime config: \`${containerId}\``,
      });
    }
  }

  if (issues.length === 0) {
    console.log("embla audit: 0 issues");
    return;
  }

  const grouped = new Map();
  for (const issue of issues) {
    const list = grouped.get(issue.file) ?? [];
    list.push(issue);
    grouped.set(issue.file, list);
  }

  console.log(
    `embla audit: ${issues.length} issue${issues.length === 1 ? "" : "s"} in ${grouped.size} file${grouped.size === 1 ? "" : "s"}`,
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
