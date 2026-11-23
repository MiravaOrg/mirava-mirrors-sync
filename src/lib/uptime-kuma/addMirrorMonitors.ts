
import { MonitorType } from "@ruslanpdf/uptime-kuma-api";
import type { Mirror } from "../mirava-mirrors";
import { uptimeKumaClient } from "./client";

type Fn<T> = () => Promise<T>;

async function runWithConcurrency<T>(
  tasks: Array<Fn<T>>,
  concurrency: number,
) {
  const results: T[] = [];
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= tasks.length) return;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, tasks.length) },
      () => worker(),
    ),
  );

  return results;
}

export async function addMirrorMonitors(
  mirrors: Array<Mirror>,
  opts?: { concurrency?: number },
) {
  const concurrency = opts?.concurrency ?? 2;

  console.log("[Mirava Sync] Fetching existing monitors...");

  const existingMonitors = await uptimeKumaClient.getMonitors();

  const existingUrls = new Set(
    existingMonitors
      .map((monitor) => monitor.url)
      .filter((url): url is string => Boolean(url))
      .map((url) => url.trim().replace(/\/+$/, "")),
  );

  const desiredMonitors: Array<{
    name: string;
    url: string;
  }> = [];

  for (const mirror of mirrors) {
    if (mirror.packageUrls?.length) {
      for (const pkg of mirror.packageUrls) {
        desiredMonitors.push({
          name: `${mirror.name}: ${pkg.name}`,
          url: pkg.url,
        });
      }
    } else {
      desiredMonitors.push({
        name: mirror.name,
        url: mirror.url,
      });
    }
  }

  const uniqueMonitors = new Map(
    desiredMonitors.map((monitor) => [
      monitor.url.trim().replace(/\/+$/, ""),
      monitor,
    ]),
  );

  const newMonitors = [...uniqueMonitors.values()].filter(
    (monitor) =>
      !existingUrls.has(
        monitor.url.trim().replace(/\/+$/, ""),
      ),
  );

  console.log(
    `[Mirava Sync] Existing=${existingMonitors.length}, New=${newMonitors.length}`,
  );

  const tasks: Array<Fn<unknown>> = newMonitors.map((monitor) => async () => {
    console.log(`[Mirava Sync] Adding: ${monitor.name}`);

    return uptimeKumaClient.addMonitor({
      name: monitor.name,
      type: MonitorType.HTTP,
      accepted_statuscodes: ["200-299"],
      active: true,
      url: monitor.url,
      method: "GET",
      interval: 60,
      timeout: 60,
    });
  });

  const created = await runWithConcurrency(tasks, concurrency);

  console.log(`[Mirava Sync] Created ${created.length} monitors.`);

  return created;
}
