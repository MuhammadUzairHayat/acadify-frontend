import { HomePageClient } from "@/components/pages/home/HomePageClient";
import { renderPrefetched } from "@/lib/server/render";
import { prefetchHomePage } from "@/lib/server/prefetch";

export default async function Page() {
  return renderPrefetched(prefetchHomePage, <HomePageClient />);
}
