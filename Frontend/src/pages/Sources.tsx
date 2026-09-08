import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar, FilterChips } from "@/components/FilterBar";
import { SourceCard } from "@/components/SourceCard";
import { DemoDataTag, Disclaimer, EmptyState } from "@/components/states";
import { sources } from "@/data/mockData";
import { SOURCE_CATEGORY_LABELS } from "@/lib/constants";

const filters = [
  { value: "all", label: "All" },
  { value: "government", label: "Government" },
  { value: "academic", label: "Academic" },
  { value: "scientific", label: "Scientific" },
  { value: "established-news", label: "News" },
  { value: "fact-checking", label: "Fact Checking" },
  { value: "primary-source", label: "Primary Source" },
];

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () =>
      sources.filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.domain.toLowerCase().includes(query.toLowerCase());
        const matchesCat = category === "all" || s.category === category;
        return matchesQuery && matchesCat;
      }),
    [query, category]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Source Verification"
        description="Search and review trusted sources used for claim cross-referencing."
        actions={<DemoDataTag />}
      />

      <div className="space-y-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search source or domain…"
          className="max-w-xl"
        />
        <FilterChips
          options={filters}
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface-2/40 px-4 py-2.5 text-xs text-muted">
        {filtered.length} sources •{" "}
        {category === "all"
          ? "All categories"
          : SOURCE_CATEGORY_LABELS[
              category as keyof typeof SOURCE_CATEGORY_LABELS
            ]}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No sources found"
          description="Try adjusting your search or category filter."
        />
      )}

      <Disclaimer />
    </div>
  );
}
