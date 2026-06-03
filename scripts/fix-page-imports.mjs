import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, "..", "app");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === "page.tsx") files.push(p);
  }
  return files;
}

const dynamicRoutes = [
  "courses/[slug]",
  "academies/[slug]",
  "student/certificates/[certificateId]",
  "student/courses/[courseId]/play",
  "owner/enrollments/[enrollmentId]",
  "owner/courses/[id]/announcements",
  "owner/courses/[id]/content",
  "owner/courses/[id]/settings",
  "owner/courses/[id]/students",
];

for (const pagePath of walk(appDir)) {
  let content = fs.readFileSync(pagePath, "utf8");
  content = content.replace(/@components\//g, "@/components/");

  const rel = path.relative(appDir, pagePath).split(path.sep).join("/");
  const isDynamic = rel.includes("[");

  if (isDynamic && /params: Promise/.test(content)) {
    const clientImport = content.match(/import \{ (\w+) \}/)?.[1];
    const from = content.match(/from "([^"]+)"/)?.[1];
    if (clientImport && from) {
      const needsSuspense = content.includes("Suspense");
      if (needsSuspense) {
        content = `import { Suspense } from "react";\nimport { Loader } from "@/components/ui/Loader";\nimport { ${clientImport} } from "${from}";\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-primary"><Loader size="lg" /></div>}>\n      <${clientImport} />\n    </Suspense>\n  );\n}\n`;
      } else {
        content = `import { ${clientImport} } from "${from}";\n\nexport default function Page() {\n  return <${clientImport} />;\n}\n`;
      }
    }
  }

  fs.writeFileSync(pagePath, content);
}

// Fix HomePageClient export name
const homeClient = path.join(__dirname, "..", "components", "pages", "home", "HomePageClient.tsx");
if (fs.existsSync(homeClient)) {
  let h = fs.readFileSync(homeClient, "utf8");
  h = h.replace(/export function PagetsxPageClient/g, "export function HomePageClient");
  h = h.replace(/export default function HomePage/g, "export function HomePageClient");
  fs.writeFileSync(homeClient, h);
}

console.log("Fixed imports and dynamic pages");
