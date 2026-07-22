import type { Metadata } from "next";
import { ExploreSearch } from "@/components/ExploreSearch";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search local AI tools, models, and guides.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="shell">
      <div className="page-head">
        <h1>Explore the catalog</h1>
        <p>
          Search runtimes, desktop apps, coding assistants, open-weight models,
          and learning guides. Results come from Ember&apos;s JSON APIs.
        </p>
      </div>
      <ExploreSearch
        initialQuery={params.q ?? ""}
        initialType={params.type ?? "all"}
      />
    </div>
  );
}
