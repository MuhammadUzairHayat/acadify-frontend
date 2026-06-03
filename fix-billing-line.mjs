import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(
  dir,
  "components/pages/owner/billing/OwnerBillingPageClient.tsx",
);
let c = fs.readFileSync(p, "utf8");
const old = 'plan.pricing && "startingAt" in plan.pricing ? (';
const neu = "isEnterprisePricing(plan.pricing) ? (";
if (!c.includes(old)) {
  console.error("pattern not found");
  process.exit(1);
}
fs.writeFileSync(p, c.replace(old, neu));
console.log("fixed");
