import { ExploreSearch } from "@/components/explore-search";

export const metadata = {
  title: "Explore",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="shell">
      <div className="page-hero">
        <h1>Explore local models & tools</h1>
        <p className="section-lead">
          Search the catalog via the same <code className="inline-code">/api/catalog/search</code>{" "}
          endpoint your apps can call.
        </p>
      </div>
      <ExploreSearch initialQuery={params.q ?? ""} />
    </div>
  );
}
