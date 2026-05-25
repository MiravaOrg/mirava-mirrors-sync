import { env } from "../../env";
import { uptimeKumaClient } from "./client";

export async function initializeUptimeKumaClient() {
  if(uptimeKumaClient.isConnected()) return
  await uptimeKumaClient.connect()
  await uptimeKumaClient.login({
    password: env.UPTIME_KUMA_PASS,
    username: env.UPTIME_KUMA_USER
  })
}