import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readText(targetPath) {
  return fs.readFile(targetPath, "utf8");
}

function pushIssue(collection, file, message) {
  collection.push({ file: path.relative(root, file), message });
}

async function main() {
  const errors = [];
  const warnings = [];

  for (const file of [
    path.join(publicDir, "CNAME"),
    path.join(publicDir, "_headers"),
  ]) {
    if (await fileExists(file)) {
      pushIssue(errors, file, "Host-specific file should not exist for this GitHub Pages setup");
    }
  }

  const robotsPath = path.join(publicDir, "robots.txt");
  if (await fileExists(robotsPath)) {
    const robots = await readText(robotsPath);
    if (!/Sitemap:\s*https:\/\/auxodata\.com\/sitemap-index\.xml/i.test(robots)) {
      pushIssue(errors, robotsPath, "Expected canonical sitemap-index entry");
    }
    if (/^\s*Allow:/im.test(robots)) {
      pushIssue(warnings, robotsPath, "Redundant `Allow:` directives add noise for a permissive robots file");
    }
  } else {
    pushIssue(errors, robotsPath, "`robots.txt` is missing");
  }

  const manifestPath = path.join(publicDir, "manifest.json");
  if (await fileExists(manifestPath)) {
    const manifest = JSON.parse(await readText(manifestPath));
    for (const key of ["id", "name", "short_name", "start_url", "display", "icons"]) {
      const value = manifest[key];
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      if (value == null || value === "" || isEmptyArray) {
        pushIssue(errors, manifestPath, `Missing required manifest field: \`${key}\``);
      }
    }

    if ("share_target" in manifest) {
      pushIssue(warnings, manifestPath, "`share_target` exists; keep only if there is a real `/share` handler");
    }
    if (Array.isArray(manifest.related_applications) && manifest.related_applications.length === 0) {
      pushIssue(warnings, manifestPath, "Empty `related_applications` should be removed");
    }
    if (Array.isArray(manifest.screenshots) && manifest.screenshots.length === 0) {
      pushIssue(warnings, manifestPath, "Empty `screenshots` should be removed");
    }

    if (Array.isArray(manifest.icons)) {
      for (const icon of manifest.icons) {
        const iconSrc = icon?.src;
        if (!iconSrc) {
          pushIssue(errors, manifestPath, "Manifest icon entry is missing `src`");
          continue;
        }
        const iconPath = path.join(publicDir, iconSrc.replace(/^\//, ""));
        if (!(await fileExists(iconPath))) {
          pushIssue(errors, manifestPath, `Manifest icon missing on disk: ${iconSrc}`);
        }
      }
    }
  } else {
    pushIssue(errors, manifestPath, "`manifest.json` is missing");
  }

  const securityPath = path.join(publicDir, ".well-known", "security.txt");
  if (await fileExists(securityPath)) {
    const security = await readText(securityPath);
    if (!/^Contact:/im.test(security)) {
      pushIssue(errors, securityPath, "Missing `Contact:` field");
    }

    const expiresMatch = security.match(/^Expires:\s*(.+)$/im);
    if (!expiresMatch) {
      pushIssue(errors, securityPath, "Missing `Expires:` field");
    } else {
      const expiresAt = new Date(expiresMatch[1].trim());
      if (Number.isNaN(expiresAt.getTime())) {
        pushIssue(errors, securityPath, "`Expires:` is not a valid date");
      } else {
        const daysRemaining = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysRemaining < 30) {
          pushIssue(warnings, securityPath, "`Expires:` is less than 30 days away");
        }
      }
    }
  } else {
    pushIssue(errors, securityPath, "`.well-known/security.txt` is missing");
  }

  const aiPath = path.join(publicDir, "ai.txt");
  if (await fileExists(aiPath)) {
    const aiText = (await readText(aiPath)).trim();
    if (aiText.length === 0) {
      pushIssue(errors, aiPath, "`ai.txt` is empty");
    }
  } else {
    pushIssue(errors, aiPath, "`ai.txt` is missing");
  }

  const stylesDir = path.join(publicDir, "styles");
  if (await fileExists(stylesDir)) {
    const entries = await fs.readdir(stylesDir, { withFileTypes: true });
    const cssFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".css"));
    if (cssFiles.length === 0) {
      pushIssue(warnings, stylesDir, "`public/styles` exists but has no CSS files");
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("public audit: 0 issues");
    return;
  }

  console.log(
    `public audit: ${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`,
  );

  for (const [label, issues] of [
    ["errors", errors],
    ["warnings", warnings],
  ]) {
    if (issues.length === 0) continue;
    console.log(`${label}:`);
    for (const issue of issues) {
      console.log(`- ${issue.file}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
