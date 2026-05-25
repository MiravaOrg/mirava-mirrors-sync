import { UptimeKumaClient } from "@ruslanpdf/uptime-kuma-api"
import { env } from "../../env"

export const uptimeKumaClient = new UptimeKumaClient({
  url: env.UPTIME_KUMA_BASE_URL,
  timeout: 600000
})
