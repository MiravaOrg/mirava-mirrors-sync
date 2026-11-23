
import { fetchAllMirrors } from "./lib/mirava-mirrors";
import { initializeUptimeKumaClient } from "./lib/uptime-kuma/initializeUptimeKumaClient";
import { addMirrorMonitors } from "./lib/uptime-kuma/addMirrorMonitors";
import { createMirrorsStatusPage } from "./lib/uptime-kuma/createMirrorsStatusPage";

console.log("[Mirava Sync] Starting...");

try {
  console.log("[Mirava Sync] Connecting to Uptime Kuma...");
  await initializeUptimeKumaClient();

  console.log("[Mirava Sync] Fetching mirrors...");
  const mirrors = await fetchAllMirrors();

  const allMirrors = [
    ...mirrors.global_mirrors,
    ...mirrors.official_iran_mirrors,
  ];

  console.log(`[Mirava Sync] Found ${allMirrors.length} mirrors.`);

  console.log("[Mirava Sync] Synchronizing monitor list...");
  const mirrorMonitorIds = await addMirrorMonitors(allMirrors);

  console.log(
    `[Mirava Sync] Resolved ${mirrorMonitorIds.length} mirror monitors.`,
  );

  console.log("[Mirava Sync] Updating status page...");
  await createMirrorsStatusPage(mirrorMonitorIds);

  console.log("[Mirava Sync] Synchronization completed successfully.");
} catch (error) {
  console.error("[Mirava Sync] Failed:", error);
  process.exitCode = 1;
}
