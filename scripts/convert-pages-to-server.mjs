import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appDir = path.join(root, "app");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === "page.tsx") files.push(p);
  }
  return files;
}

function toPascalCase(s) {
  return s
    .replace(/(^|[-_/])(\w)/g, (_, __, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function pagePathToComponent(pagePath) {
  const rel = path.relative(appDir, pagePath).split(path.sep).join("/");
  const parts = rel.replace("/page.tsx", "").split("/");
  const filtered = parts.filter((p) => !p.startsWith("("));
  const name = (filtered.map(toPascalCase).join("") || "Home") + "PageClient";
  const subdir = filtered.join("/");
  return { rel, name, subdir };
}

const skip = new Set([
  "app/(public)/login/page.tsx",
  "app/(protected)/student/dashboard/page.tsx",
  "app/(protected)/student/page.tsx",
]);

for (const pagePath of walk(appDir)) {
  const relNorm = path.relative(root, pagePath).split(path.sep).join("/");
  if (skip.has(relNorm)) {
    console.log("Skip:", relNorm);
    continue;
  }

  let content = fs.readFileSync(pagePath, "utf8");
  const isClient = /^["']use client["'];?\s*/m.test(content);
  if (!isClient) {
    console.log("Already server:", relNorm);
    continue;
  }

  const { name, subdir } = pagePathToComponent(pagePath);
  const compDir = path.join(root, "components", "pages", subdir || "root");
  fs.mkdirSync(compDir, { recursive: true });
  const compPath = path.join(compDir, `${name}.tsx`);

  content = content.replace(/^["']use client["'];?\s*\n?/m, '"use client";\n\n');

  const defaultFn = content.match(/export default function (\w+)/);
  if (defaultFn) {
    content = content.replace(
      /export default function \w+/,
      `export function ${name}`,
    );
  }

  fs.writeFileSync(compPath, content);

  const importPath =
    "@" +
    path
      .relative(path.join(root), compPath)
      .split(path.sep)
      .join("/")
      .replace(/\.tsx$/, "");

  const needsSuspense = /useSearchParams/.test(content);
  const hasParams =
    /params\s*:\s*Promise|params\s*:\s*\{/.test(content) ||
    relNorm.includes("[");
  const paramMatch = relNorm.match(/\[(\w+)\]/g);
  const paramNames = paramMatch
    ? paramMatch.map((m) => m.slice(1, -1))
    : [];

  let serverPage = "";
  if (needsSuspense) {
    serverPage += 'import { Suspense } from "react";\n';
    serverPage += 'import { Loader } from "@/components/ui/Loader";\n';
  }
  serverPage += `import { ${name} } from "${importPath}";\n\n`;

  if (hasParams && paramNames.length > 0) {
    const paramsType = paramNames.map((p) => `${p}: string`).join("; ");
    serverPage += `type PageProps = { params: Promise<{ ${paramsType} }> };\n\n`;
    serverPage += "export default async function Page({ params }: PageProps) {\n";
    const destruct = paramNames.map((p) => `  const ${p} = (await params).${p};\n`).join("");
    serverPage += destruct;
    if (needsSuspense) {
      serverPage += `  return (\n    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-primary"><Loader size="lg" /></div>}>\n      <${name}${paramNames.length ? " " + paramNames.map((p) => `${p}={${p}}`).join(" ") : ""} />\n    </Suspense>\n  );\n}\n`;
    } else {
      serverPage += `  return <${name} ${paramNames.map((p) => `${p}={${p}}`).join(" ")} />;\n}\n`;
    }
  } else {
    serverPage += "export default function Page() {\n";
    if (needsSuspense) {
      serverPage += '  return (\n    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-primary"><Loader size="lg" /></div>}>\n      <' + name + " />\n    </Suspense>\n  );\n}\n";
    } else {
      serverPage += `  return <${name} />;\n}\n`;
    }
  }

  fs.writeFileSync(pagePath, serverPage);
  console.log("Converted:", relNorm, "->", importPath);
}
