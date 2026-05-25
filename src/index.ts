import { fetchAllMirrors } from "./lib/mirava-mirrors";
import { addMirrorMonitors } from "./lib/uptime-kuma/addMirrorMonitors";
import { createMirrorsStatusPage } from "./lib/uptime-kuma/createMirrorsStatusPage";
import { deleteAllMonitors } from "./lib/uptime-kuma/deleteAllMonitors";
import { initializeUptimeKumaClient } from "./lib/uptime-kuma/initializeUptimeKumaClient";

console.log("Initializing Uptime Kuma Client...")
await initializeUptimeKumaClient()

console.log("Deleting all monitors...")
await deleteAllMonitors()

console.log("Fetching all mirrors...")
const mirrors = await fetchAllMirrors()

console.log("Adding monitors...")
await addMirrorMonitors([...mirrors.global_mirrors, ...mirrors.official_iran_mirrors])

console.log("Done, now manually update the status page")
process.exit()
// This step doesn't work for whatever reason so do it manually
// await createMirrorsStatusPage()