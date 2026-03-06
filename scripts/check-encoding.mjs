import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".sql", ".yml", ".yaml", ".css", ".scss", ".html", ".svg"
]);

const skipDirs = new Set([
  ".git", "node_modules", ".next", "out", "dist", "build", "coverage", ".turbo", ".vercel"
]);

const decoder = new TextDecoder("utf-8", { fatal: true });
const failures = [];
const suspiciousTextChecks = [
  {
    label: "Unicode replacement character detected",
    regex: /\uFFFD/u,
  },
  {
    label: "Suspicious CJK compatibility ideograph detected",
    regex: /[\uF900-\uFAFF]/u,
  },
];

function listFilesAll(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      listFilesAll(path.join(dir, entry.name), out);
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (textExtensions.has(ext)) out.push(fullPath);
  }
}

function runGit(cmd) {
  try {
    return execSync(cmd, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function listFilesChanged() {
  const set = new Set();
  const diffWorktree = runGit("git diff --name-only --diff-filter=ACMRTUXB HEAD");
  const diffStaged = runGit("git diff --name-only --cached --diff-filter=ACMRTUXB");
  const untracked = runGit("git ls-files --others --exclude-standard");

  for (const rel of [...diffWorktree, ...diffStaged, ...untracked]) {
    const full = path.resolve(repoRoot, rel);
    if (!fs.existsSync(full)) continue;
    const ext = path.extname(full).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    set.add(full);
  }
  return [...set];
}

function validateFile(fullPath) {
  const rel = path.relative(repoRoot, fullPath).replace(/\\/g, "/");
  const buf = fs.readFileSync(fullPath);

  if (buf.length >= 2) {
    const b0 = buf[0];
    const b1 = buf[1];
    if ((b0 === 0xff && b1 === 0xfe) || (b0 === 0xfe && b1 === 0xff)) {
      failures.push(`${rel}: UTF-16 BOM detected`);
      return;
    }
  }

  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    failures.push(`${rel}: UTF-8 BOM detected (use UTF-8 without BOM)`);
    return;
  }

  if (buf.includes(0x00)) {
    failures.push(`${rel}: NUL byte detected (likely non-UTF-8 text encoding)`);
    return;
  }

  let text = "";
  try {
    text = decoder.decode(buf);
  } catch {
    failures.push(`${rel}: Invalid UTF-8 byte sequence`);
    return;
  }

  for (const check of suspiciousTextChecks) {
    if (check.regex.test(text)) {
      failures.push(`${rel}: ${check.label}`);
    }
  }
}

const checkAll = process.argv.includes("--all");
const targets = checkAll ? (() => {
  const out = [];
  listFilesAll(repoRoot, out);
  return out;
})() : listFilesChanged();

for (const file of targets) {
  validateFile(file);
}

if (failures.length > 0) {
  console.error("Encoding check failed:\n");
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}

console.log(`Encoding check passed (${checkAll ? "full" : "changed"} scope).`);
