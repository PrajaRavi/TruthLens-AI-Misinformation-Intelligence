import { claims, sources } from "@/data/mockData";
import type { Claim, Source } from "@/types";

/**
 * Source verification & claim cross-referencing service layer.
 * Currently returns mock data; swap for real API calls when the backend exists.
 */

const MOCK_LATENCY = 400;

function delay<T>(value: T, ms = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function searchSources(query = ""): Promise<Source[]> {
  const q = query.trim().toLowerCase();
  const results = q
    ? sources.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
      )
    : sources;
  return delay(results);
}

export async function verifyClaim(claimId: string): Promise<Claim | undefined> {
  return delay(claims.find((c) => c.id === claimId));
}

export async function getSourceDetails(id: string): Promise<Source | undefined> {
  return delay(sources.find((s) => s.id === id));
}
