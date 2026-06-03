"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { AcademyCard } from "@/components/academies/AcademyCard";
import { AcademiesInfiniteList } from "@/components/academies/AcademiesInfiniteList";
import { FilterChips } from "@/components/academies/FilterChips";
import { IconTrophy } from "@/components/academies/AcademyIcons";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  useAcademyCategories,
  useTopAcademies,
  type AcademiesBrowseFilters,
} from "@/hooks/useAcademiesBrowse";

const PRICE_FILTERS = [
  { id: "", label: "All" },
  { id: "free", label: "Free" },
  { id: "under_50", label: "< $50" },
  { id: "50_100", label: "$50–100" },
  { id: "100_plus", label: "$100+" },
];

const SORT_OPTIONS = [
  { id: "best_rated", label: "Top rated" },
  { id: "most_reviewed", label: "Most reviews" },
  { id: "most_students", label: "Most students" },
  { id: "most_courses", label: "Most courses" },
  { id: "newest", label: "Newest" },
] as const;

export function AcademiesPageClient() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<
    "" | "free" | "under_50" | "50_100" | "100_plus"
  >("");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["id"]>("best_rated");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useAcademyCategories();
  const topRatedQuery = useTopAcademies(3);
  const topRated = topRatedQuery.data ?? [];
  const topLoading =
    topRatedQuery.isLoading ||
    topRatedQuery.isPending ||
    (!topRatedQuery.data && topRatedQuery.isFetching);

  const browseFilters = useMemo<AcademiesBrowseFilters>(
    () => ({
      search: search || undefined,
      category,
      priceRange: priceRange || undefined,
      sort,
    }),
    [search, category, priceRange, sort],
  );

  const categoryOptions = [
    { id: "All", label: "All" },
    ...categories.map((c) => ({ id: c.name, label: c.name })),
  ];

  const hasFilters = !!search || category !== "All" || !!priceRange;
  const showTopSection = !hasFilters;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("All");
    setPriceRange("");
    setSort("best_rated");
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <HomeNavbar />

      <section className="relative pt-20 pb-10 md:pt-24 md:pb-12 overflow-hidden border-b border-border-subtle">
        <div className="absolute inset-0 home-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-linear-to-b from-background-primary via-transparent to-background-primary" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-3">
            Institutions
          </p>
          <h1 className="animate-fade-in-delay text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-2">
            Academies
          </h1>
          <p className="animate-fade-in-delay-2 text-text-secondary text-sm md:text-base mb-8">
            Learn from the best.
          </p>

          <form
            onSubmit={handleSearch}
            className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
          >
            <div className="flex-1 flex items-center bg-surface/80 backdrop-blur-md border border-border-subtle rounded-2xl p-1.5">
              <div className="flex-1 min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:ring-0 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:ring-0">
                <Input
                  placeholder="Search academies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  icon={
                    <svg className="h-4 w-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <Button type="submit" size="sm" className="shrink-0 rounded-xl px-5">
                Search
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden rounded-xl"
              onClick={() => setShowFilters((v) => !v)}
            >
              {showFilters ? "Hide" : "Filters"}
            </Button>
          </form>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <RevealOnScroll delay={100}>
          <Card
            padding="lg"
            className={`mb-8 border-border-subtle bg-surface/40 space-y-5 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-tertiary">
                Refine
              </p>
              {hasFilters ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              ) : null}
            </div>

            <FilterChips
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />

            <FilterChips
              label="Price"
              options={PRICE_FILTERS}
              value={priceRange}
              onChange={(value) => setPriceRange(value as typeof priceRange)}
            />

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Sort</p>
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as (typeof SORT_OPTIONS)[number]["id"])
                }
                aria-label="Sort academies"
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-subtle bg-background-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </RevealOnScroll>

        {showTopSection ? (
          <section className="mb-14">
            <RevealOnScroll>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-1.5">
                  Top rated
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight inline-flex items-center gap-2">
                  <IconTrophy className="h-5 w-5 text-amber-400" />
                  Best academies
                </h2>
              </div>
            </RevealOnScroll>

            {topLoading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            ) : topRated.length > 0 ? (
              <RevealGroup className="grid md:grid-cols-3 gap-4" stagger={110}>
                {topRated.map((academy, index) => (
                  <RevealItem key={academy.id} index={index}>
                    <AcademyCard academy={academy} compact />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : null}
          </section>
        ) : null}

        <AcademiesInfiniteList
          filters={browseFilters}
          onClearFilters={clearFilters}
          hideHeader={showTopSection}
        />
      </main>
    </div>
  );
}
