
import { uptimeKumaClient } from "./client";

const STATUS_PAGE_SLUG = "default";
const MIRAVA_GROUP_NAME = "Mirava Mirrors";

export async function createMirrorsStatusPage(
  mirrorMonitorIds: number[],
) {
  console.log("[Mirava Sync] Updating status page...");

  const statusPage =
    await uptimeKumaClient.getStatusPage(STATUS_PAGE_SLUG);

  const groups = [...(statusPage.publicGroupList ?? [])];

  const groupIndex = groups.findIndex(
    (group) => group.name === MIRAVA_GROUP_NAME,
  );

  if (groupIndex === -1) {
    groups.push({
      name: MIRAVA_GROUP_NAME,
      monitorList: [...new Set(mirrorMonitorIds)],
    });
  } else {
    const existingIds = groups[groupIndex].monitorList ?? [];

    groups[groupIndex] = {
      ...groups[groupIndex],
      monitorList: [
        ...new Set([...existingIds, ...mirrorMonitorIds]),
      ],
    };
  }

  await uptimeKumaClient.saveStatusPage(
    STATUS_PAGE_SLUG,
    {
      ...statusPage,
      publicGroupList: groups,
    },
  );

  console.log("[Mirava Sync] Status page updated safely.");
}
