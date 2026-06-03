"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { FilterChips } from "@/components/academies/FilterChips";
import { CourseCard } from "@/components/courses/CourseCard";
import { CoursesInfiniteList } from "@/components/courses/CoursesInfiniteList";
import { IconTrophy } from "@/components/academies/AcademyIcons";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  useCourseCategories,
  useCourseCatalogSections,
} from "@/hooks/useCoursesPublic";
import type { CourseListItem } from "@/lib/types";

const CATEGORY_PRESETS = [
  "Development",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Health",
  "Language",
];

const LEVEL_FILTERS = [
  { id: "All", label: "All" },
  { id: "BEGINNER", label: "Beginner" },
  { id: "INTERMEDIATE", label: "Intermediate" },
  { id: "EXPERT", label: "Expert" },
];

const PRICE_FILTERS = [
  { id: "", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "under_50", label: "< $50" },
  { id: "50_100", label: "$50–100" },
  { id: "100_plus", label: "$100+" },
];

const SORT_OPTIONS = [
  { id: "best_rated", label: "Top rated" },
  { id: "most_enrolled", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Price ↑" },
  { id: "price_desc", label: "Price ↓" },
] as const;

function SectionLabel({ eyebrow, title }: { eyebrow?: string; title: ReactNode }) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-1.5">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight inline-flex items-center gap-2">
        {title}
      </h2>
    </div>
  );
}

function CatalogSection({
  eyebrow,
  title,
  icon,
  courses,
  columns = "md:grid-cols-3",
  onEnroll,
}: {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  courses: CourseListItem[];
  columns?: string;
  onEnroll: (course: CourseListItem) => void;
}) {
  if (courses.length === 0) return null;

  return (
    <section className="mb-14">
      <RevealOnScroll>
        <SectionLabel eyebrow={eyebrow} title={<>{icon}{title}</>} />
      </RevealOnScroll>
      <RevealGroup className={`grid gap-4 ${columns}`} stagger={100}>
        {courses.map((course, index) => (
          <RevealItem key={course.id} index={index}>
            <CourseCard course={course} variant="grid" onEnroll={onEnroll} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function CoursesPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-primary">
          <Loader size="lg" />
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [level, setLevel] = useState(searchParams.get("level") || "All");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["id"]>(
    (searchParams.get("sort") as (typeof SORT_OPTIONS)[number]["id"]) || "best_rated",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useCourseCategories();

  const hasFilters = !!search || category !== "All" || level !== "All" || !!priceRange;
  const showSpecialSections = page === 1 && !hasFilters;

  const { trending, featured, newCourses, freeCourses, isLoading: catalogLoading } =
    useCourseCatalogSections(showSpecialSections);

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (level !== "All") params.set("level", level);
    if (priceRange) params.set("priceRange", priceRange);
    if (sort !== "best_rated") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/courses?${qs}` : "/courses", { scroll: false });
  }, [search, category, level, priceRange, sort, page, router]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("All");
    setLevel("All");
    setPriceRange("");
    setSort("best_rated");
    setPage(1);
  };

  const handleEnroll = (course: CourseListItem) => {
    router.push(`/courses/${course.slug}`);
  };

  const categoryOptions = [
    { id: "All", label: "All" },
    ...(categories.length > 0
      ? categories.map((c) => ({ id: c.name, label: c.name }))
      : CATEGORY_PRESETS.map((name) => ({ id: name, label: name }))),
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      <HomeNavbar />

      {/* Page hero */}
      <section className="relative pt-20 pb-10 md:pt-24 md:pb-12 overflow-hidden border-b border-border-subtle">
        <div className="absolute inset-0 home-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-linear-to-b from-background-primary via-transparent to-background-primary" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-3">
            Catalog
          </p>
          <h1 className="animate-fade-in-delay text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-2">
            Courses
          </h1>
          <p className="animate-fade-in-delay-2 text-text-secondary text-sm md:text-base mb-8">
            Find your next skill.
          </p>

          <form
            onSubmit={handleSearch}
            className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-2 max-w-2xl"
          >
            <div className="flex-1 flex items-center bg-surface/80 backdrop-blur-md border border-border-subtle rounded-2xl p-1.5">
              <div className="flex-1 min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:ring-0 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:ring-0">
                <Input
                  placeholder="Search courses..."
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
        <RevealOnScroll delay={50}>
          <FilterChips
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          />
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <Card
            padding="lg"
            className={`my-5 border-border-subtle bg-surface/40 space-y-5 ${showFilters ? "block" : "hidden lg:block"}`}
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
              label="Level"
              options={LEVEL_FILTERS}
              value={level}
              onChange={(value) => {
                setLevel(value);
                setPage(1);
              }}
            />

            <FilterChips
              label="Price"
              options={PRICE_FILTERS}
              value={priceRange}
              onChange={(value) => {
                setPriceRange(value);
                setPage(1);
              }}
            />

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Sort</p>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as (typeof SORT_OPTIONS)[number]["id"]);
                  setPage(1);
                }}
                aria-label="Sort courses"
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

        {showSpecialSections && catalogLoading ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : null}

        {showSpecialSections && !catalogLoading ? (
          <>
            <CatalogSection
              eyebrow="Hot"
              title="Trending"
              icon={<span className="text-base">🔥</span>}
              courses={trending}
              onEnroll={handleEnroll}
            />
            <CatalogSection
              eyebrow="Picks"
              title="Featured"
              icon={<IconTrophy className="h-5 w-5 text-amber-400" />}
              courses={featured}
              onEnroll={handleEnroll}
            />
            <CatalogSection
              eyebrow="Fresh"
              title="New"
              courses={newCourses}
              columns="sm:grid-cols-2 lg:grid-cols-4"
              onEnroll={handleEnroll}
            />
            <CatalogSection
              eyebrow="Free"
              title="No cost"
              courses={freeCourses}
              columns="sm:grid-cols-2 lg:grid-cols-4"
              onEnroll={handleEnroll}
            />
          </>
        ) : null}

        <CoursesInfiniteList
          filters={{
            search: search || undefined,
            category: category !== "All" ? category : undefined,
            level: level !== "All" ? level : undefined,
            priceRange: (priceRange || undefined) as
              | "free"
              | "paid"
              | "under_50"
              | "50_100"
              | "100_plus"
              | undefined,
            sort,
          }}
          onEnroll={handleEnroll}
          onClearFilters={clearFilters}
          hideHeader={showSpecialSections}
        />
      </main>
    </div>
  );
}
