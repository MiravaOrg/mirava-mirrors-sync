import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  runtimeEnv: process.env,
  server: {
    UPTIME_KUMA_USER: z.string(),
    UPTIME_KUMA_PASS: z.string(),
    UPTIME_KUMA_BASE_URL: z.url(),
    MIRAVA_MIRRORS_LIST: z.url().default("https://miravaorg.ir/mirror.json"),
  },
  emptyStringAsUndefined: true
})