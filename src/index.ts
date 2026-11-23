
import { fetchAllMirrors } from "./lib/mirava-mirrors";

console.log("Fetching all mirrors...");

const mirrors = await fetchAllMirrors();

const allMirrors = [
  ...mirrors.global_mirrors,
  ...mirrors.official_iran_mirrors,
];

console.log(`Found ${allMirrors.length} mirrors.`);

for (const mirror of allMirrors) {
  console.log(`- ${mirror.name}: ${mirror.url}`);
}

console.log("Mirror list fetched successfully.");
console.log("Dry run completed. No Uptime Kuma changes were made.");
