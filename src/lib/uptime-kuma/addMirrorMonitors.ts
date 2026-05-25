import { MonitorType } from "@ruslanpdf/uptime-kuma-api";
import type { Mirror } from "../mirava-mirrors";
import { uptimeKumaClient } from "./client";

type Fn<T> = () => Promise<T>;

async function runWithConcurrency<T>(tasks: Array<Fn<T>>, concurrency: number) {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= tasks.length) return;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}

export async function addMirrorMonitors(mirrors: Array<Mirror>, opts?: { concurrency?: number }) {
  const concurrency = opts?.concurrency ?? 2;

  console.log(`[addMirrorMonitors] Starting. mirrors=${mirrors.length}, concurrency=${concurrency}`);

  // Build a flat list of tasks, then execute with limited concurrency.
  const tasks: Array<() => Promise<any>> = [];

  for (let mIdx = 0; mIdx < mirrors.length; mIdx++) {
    const mirror = mirrors[mIdx]!;

    if (mirror.packageUrls?.length) {
      console.log(
        `[addMirrorMonitors] Mirror [${mIdx + 1}/${mirrors.length}] "${mirror.name}" has ${mirror.packageUrls.length} packageUrls`,
      );

      for (let pIdx = 0; pIdx < mirror.packageUrls.length; pIdx++) {
        const pckg = mirror.packageUrls[pIdx];

        tasks.push(async () => {
          console.log(
            `[addMirrorMonitors] Adding monitor (${mIdx + 1}/${mirrors.length}) pkg [${pIdx + 1}/${mirror.packageUrls!.length}] "${mirror.name}: ${pckg.name}"`,
          );

          return uptimeKumaClient.addMonitor({
            name: `${mirror.name}: ${pckg.name}`,
            type: MonitorType.HTTP,
            accepted_statuscodes: ["200-299"],
            active: true,
            url: pckg.url,
            method: "GET",
            interval: 60,
            timeout: 60,
          });
        });
      }
    } else {
      console.log(
        `[addMirrorMonitors] Mirror [${mIdx + 1}/${mirrors.length}] "${mirror.name}" has no packageUrls; adding single monitor`,
      );

      tasks.push(async () => {
        console.log(`[addMirrorMonitors] Adding monitor "${mirror.name}" url=${mirror.url}`);
        return uptimeKumaClient.addMonitor({
          name: mirror.name,
          type: MonitorType.HTTP,
          accepted_statuscodes: ["200-299"],
          active: true,
          url: mirror.url,
          method: "GET",
          interval: 60,
          timeout: 60,
        });
      });
    }
  }

  console.log(`[addMirrorMonitors] Queued tasks=${tasks.length}`);

  const created = await runWithConcurrency(tasks, concurrency);

  console.log(`[addMirrorMonitors] Done. created=${created.length}`);
  return created;
}