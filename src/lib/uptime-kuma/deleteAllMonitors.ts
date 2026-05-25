import { uptimeKumaClient } from "./client";

export async function deleteAllMonitors() {
  const monitors = await uptimeKumaClient.getMonitors();

  await Promise.all(
    monitors.map(
      (monitor) =>
        new Promise((resolve) => {
          uptimeKumaClient.deleteMonitor(monitor.id!).then(resolve);
        }),
    ),
  );
}
