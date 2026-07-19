import { request } from "./client";

export interface PublicSiteStats {
  code: number;
  count: number;
  launchDate: string | null;
  runningDays: number | null;
}

export function getPublicSiteStats() {
  return request<PublicSiteStats>("/api/visitors/count");
}
