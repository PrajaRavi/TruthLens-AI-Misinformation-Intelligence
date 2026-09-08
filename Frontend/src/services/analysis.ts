import { analyses, featuredAnalysis } from "@/data/mockData";
import type { Analysis } from "@/types";

/**
 * Service layer for content analysis.
 *
 * NOTE: These functions currently return mock data. When a Node.js + Express
 * backend is available, replace the bodies with real `fetch` calls, e.g.:
 *   const res = await fetch(`${API_BASE}/analyze/text`, { method: "POST", body })
 *   return res.json()
 * The function signatures and return types are designed to stay stable.
 */

const MOCK_LATENCY = 600;

function delay<T>(value: T, ms = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface TextAnalysisInput {
  content: string;
  source?: string;
  author?: string;
  publishedAt?: string;
}

export async function analyzeText(
  _input: TextAnalysisInput
): Promise<Analysis> {
  return delay(featuredAnalysis);
}

export async function analyzeImage(_file: File): Promise<Analysis> {
  return delay(analyses[2]);
}

export async function analyzeAudio(_file: File): Promise<Analysis> {
  return delay(analyses[4]);
}

export async function analyzeVideo(_file: File): Promise<Analysis> {
  return delay(analyses[2]);
}

export async function analyzeUrl(_url: string): Promise<Analysis> {
  return delay(analyses[1]);
}

export async function getAnalysis(id: string): Promise<Analysis | undefined> {
  return delay(analyses.find((a) => a.id === id) ?? featuredAnalysis);
}

export async function getAnalysisHistory(): Promise<Analysis[]> {
  return delay(analyses);
}
