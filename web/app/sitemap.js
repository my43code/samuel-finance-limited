import { publicDiscoveryEntries } from "../lib/public-discovery";
import { sitemapRecords } from "../lib/discovery";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  return sitemapRecords(await publicDiscoveryEntries());
}
