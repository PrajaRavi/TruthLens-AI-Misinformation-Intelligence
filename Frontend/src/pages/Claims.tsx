import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar, FilterChips } from "@/components/FilterBar";
import { ClaimCard } from "@/components/ClaimCard";
import { DemoDataTag, EmptyState } from "@/components/states";
import { Select } from "@/components/ui/Select";
import { claims } from "@/data/mockData";
import { riskLevelFromScore } from "@/lib/constants";

const statusFilters = [
  { value: "all", label: "All Statuses" },
  { value: "verified", label: "Verified" },
  { value: "supported", label: "Supported" },
  { value: "partially-supported", label: "Partially Supported" },
  { value: "unverified", label: "Unverified" },
  { value: "misleading", label: "Misleading" },
  { value: "false", label: "False" },
];

export default function ClaimsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-desc");

  const filtered = useMemo(() => {
    let rows = claims.filter((c) => {
      const matchesQuery = c.text.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || c.status === status;
      const matchesRisk =
        risk === "all" || riskLevelFromScore(c.risk) === risk;
      const matchesCat = category === "all" || c.category === category;
      return matchesQuery && matchesStatus && matchesRisk && matchesCat;
    });
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "risk-desc":
          return b.risk - a.risk;
        case "risk-asc":
          return a.risk - b.risk;
        case "confidence-desc":
          return b.confidence - a.confidence;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return rows;
  }, [query, status, risk, category, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claim Explorer"
        description="Search and filter individual claims detected across all analyses."
        actions={<DemoDataTag />}
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search claims…"
            className="lg:max-w-md"
          />
          <div className="flex flex-wrap gap-3">
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusFilters}
              className="w-48"
            />
            <Select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "all", label: "All Categories" },
                { value: "science", label: "Science" },
                { value: "health", label: "Health" },
                { value: "finance", label: "Finance" },
                { value: "technology", label: "Technology" },
                { value: "climate", label: "Climate" },
                { value: "politics", label: "Politics" },
                { value: "social-media", label: "Social Media" },
                { value: "breaking-news", label: "Breaking News" },
              ]}
              className="w-44"
            />
            <Select
              aria-label="Sort claims"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: "date-desc", label: "Newest" },
                { value: "risk-desc", label: "Highest risk" },
                { value: "risk-asc", label: "Lowest risk" },
                { value: "confidence-desc", label: "Confidence" },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <FilterChips
          options={[
            { value: "all", label: "All Risk" },
            { value: "low", label: "Low" },
            { value: "moderate", label: "Moderate" },
            { value: "high", label: "High" },
            { value: "critical", label: "Critical" },
          ]}
          value={risk}
          onChange={setRisk}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No claims found"
          description="Adjust your filters to explore more claims."
        />
      )}
    </div>
  );
}
