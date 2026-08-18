import { reports } from "@/data/mockData";
import type { Report } from "@/types";

/**
 * Reports service layer. Currently returns mock data.
 */

const MOCK_LATENCY = 500;

function delay<T>(value: T, ms = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getReports(): Promise<Report[]> {
  return delay(reports);
}

export async function generateReport(analysisId: string): Promise<Report> {
  const existing = reports.find((r) => r.analysisId === analysisId);
  if (existing) return delay(existing);
  return delay({
    id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
    analysisId,
    title: "Generated Report",
    riskLevel: "moderate",
    riskScore: 50,
    status: "ready",
    createdAt: new Date().toISOString(),
  });
}
