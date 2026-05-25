import axios from "axios";
import { env } from "../../env";
import type { MirrorsListResponse } from "./types";

export async function fetchAllMirrors(): Promise<MirrorsListResponse> {
  const { data } = await axios(env.MIRAVA_MIRRORS_LIST)
  
  if(!data) throw new Error("No data available from " + env.MIRAVA_MIRRORS_LIST)
  
  return data
}