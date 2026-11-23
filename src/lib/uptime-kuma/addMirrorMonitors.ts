
import { MonitorType } from "@ruslanpdf/uptime-kuma-api";
import type { Mirror } from "../mirava-mirrors";
import { uptimeKumaClient } from "./client";

type Fn<T> = () => Promise<T>;

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

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
): Promise<number[]> {
  const concurrency = opts?.concurrency ?? 2;

  console.log("[Mirava Sync] Fetching existing monitors...");

  const existingMonitors = await uptimeKumaClient.getMonitors();

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
      normalizeUrl(monitor.url),
      monitor,
    ]),
  );

  const existingUrls = new Set(
    existingMonitors
      .map((monitor) => monitor.url)
      .filter((url): url is string => Boolean(url))
      .map(normalizeUrl),
  );

  const newMonitors = [...uniqueMonitors.values()].filter(
    (monitor) => !existingUrls.has(normalizeUrl(monitor.url)),
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

  await runWithConcurrency(tasks, concurrency);

  const updatedMonitors = await uptimeKumaClient.getMonitors();

  const monitorIds = [...uniqueMonitors.keys()]
    .map((url) =>
      updatedMonitors.find(
        (monitor) =>
          monitor.url && normalizeUrl(monitor.url) === url,
      )?.id,
    )
    .filter((id): id is number => typeof id === "number");

  console.log(
    `[Mirava Sync] Resolved ${monitorIds.length} mirror monitor IDs.`,
  );

  return [...new Set(monitorIds)];
}
