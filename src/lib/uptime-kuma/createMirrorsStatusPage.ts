import { uptimeKumaClient } from "./client";

export async function createMirrorsStatusPage() {
  try {
    await uptimeKumaClient.deleteStatusPage("default")
  } catch (error) {
  }

  const allMonitors = await uptimeKumaClient.getMonitors()

  await uptimeKumaClient.addStatusPage({
    slug: "default",
    title: "Mirava Radar",
    publicGroupList: [
      {
        name: "Main",
        monitorList: allMonitors.map(v => v.id).filter(v => typeof v === "number")
      }
    ]
  })
}