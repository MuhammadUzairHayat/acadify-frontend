"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CourseCard } from "@/components/courses/CourseCard";
import { AcademyCard } from "@/components/academies/AcademyCard";
import { Loader } from "@/components/ui/Loader";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { HeroLearningVisual } from "@/components/pages/home/HeroLearningVisual";
import { RevealGroup, RevealItem, RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useTopAcademies } from "@/hooks/useAcademiesBrowse";
import { useTrendingCourses } from "@/hooks/useCoursesPublic";

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Courses",
    tag: "Wide catalog",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Certificates",
    tag: "Get certified",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Flexible",
    tag: "Your pace",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Academies",
    tag: "Expert led",
  },
];

const STEPS = [
  { step: "01", title: "Discover", tag: "Find your path" },
  { step: "02", title: "Learn", tag: "Track progress" },
  { step: "03", title: "Certify", tag: "Earn credentials" },
];

const TESTIMONIALS = [
  { name: "Sarah C.", role: "Developer", content: "Landed my first dev role after 3 months.", initial: "S" },
  { name: "Marcus W.", role: "Academy owner", content: "Simple tools. Global reach.", initial: "M" },
  { name: "Priya P.", role: "Designer", content: "Best design courses I've found.", initial: "P" },
];

function SectionHeader({
  eyebrow,
  title,
  action,
  delay = 0,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-2">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{title}</h2>
      </div>
      {action}
    </RevealOnScroll>
  );
}

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-28 md:pb-24 overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 home-grid-bg" />
      <div className="absolute inset-0 bg-linear-to-b from-background-primary via-transparent to-background-primary" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-white/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary mb-5">
              Skill development
            </p>
            <h1 className="animate-fade-in-delay text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1] mb-5">
              Learn.
              <br />
              <span className="text-gradient">Build. Grow.</span>
            </h1>
            <p className="animate-fade-in-delay-2 text-base md:text-lg text-text-secondary mb-8 max-w-sm mx-auto lg:mx-0">
              Expert courses. Real skills.
            </p>

            <form onSubmit={handleSearch} className="animate-fade-in-delay-2 max-w-md mx-auto lg:mx-0 mb-6">
              <div className="relative flex items-center bg-surface/80 backdrop-blur-md border border-border-subtle rounded-2xl p-1.5">
                <div className="flex-1 min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:ring-0 [&_input]:py-3 [&_input]:text-sm [&_input]:focus:ring-0">
                  <Input
                    type="text"
                    placeholder="Find a course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={
                      <svg className="h-4 w-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                </div>
                <Button type="submit" className="shrink-0 rounded-xl px-5" size="sm">
                  Search
                </Button>
              </div>
            </form>

            <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link href="/register">
                <Button size="lg" className="min-w-[160px] rounded-xl">Get started</Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="min-w-[160px] rounded-xl">Browse courses</Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <HeroLearningVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 md:py-24 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Platform" title="Why Acadify" />

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={100}>
          {FEATURES.map((feature, index) => (
            <RevealItem key={feature.title} index={index}>
              <Card
                padding="lg"
                className="group h-full bg-surface/40 border-border-subtle hover:border-border transition-colors"
              >
                <div
                  className="feature-icon-wrap w-10 h-10 rounded-xl border border-border-subtle bg-background-secondary flex items-center justify-center text-text-primary mb-4"
                  style={{ "--reveal-index": index } as React.CSSProperties}
                >
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-xs text-text-tertiary mt-1">{feature.tag}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-20 md:py-24 bg-surface/20 border-y border-border-subtle overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Path" title="How it works" />

        <RevealGroup className="relative">
          <svg
            viewBox="0 0 800 8"
            className="hidden md:block absolute top-8 left-[10%] w-[80%] h-2"
            aria-hidden
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="4"
              x2="800"
              y2="4"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="steps-path-draw"
            />
          </svg>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {STEPS.map((item, index) => (
              <RevealItem key={item.step} index={index}>
                <div className="text-center md:text-left">
                  <div
                    className="step-node inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-border-subtle bg-background-secondary text-lg font-bold text-text-tertiary mb-4"
                    style={{ "--step-index": index } as React.CSSProperties}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
                  <p className="text-xs text-text-tertiary mt-1">{item.tag}</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}

function PopularCoursesSection() {
  const router = useRouter();
  const trendingQuery = useTrendingCourses(4);
  const courses = trendingQuery.data ?? [];
  const loading =
    trendingQuery.isLoading ||
    trendingQuery.isPending ||
    (!trendingQuery.data && trendingQuery.isFetching);

  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Trending"
          title="Popular courses"
          action={
            <RevealOnScroll delay={80}>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="rounded-xl shrink-0">
                  View all
                </Button>
              </Link>
            </RevealOnScroll>
          }
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : courses.length === 0 ? (
          <RevealOnScroll>
            <Card className="text-center py-12 border-border-subtle bg-surface/40">
              <p className="text-text-secondary text-sm mb-4">Coming soon.</p>
              <Link href="/courses">
                <Button variant="outline" size="sm">Explore</Button>
              </Link>
            </Card>
          </RevealOnScroll>
        ) : (
          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={110}>
            {courses.map((course, index) => (
              <RevealItem key={course.id} index={index}>
                <CourseCard
                  course={course}
                  variant="grid"
                  onEnroll={(c) => router.push(`/courses/${c.slug}`)}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}

function PopularAcademiesSection() {
  const topAcademiesQuery = useTopAcademies(4);
  const academies = topAcademiesQuery.data ?? [];
  const loading =
    topAcademiesQuery.isLoading ||
    topAcademiesQuery.isPending ||
    (!topAcademiesQuery.data && topAcademiesQuery.isFetching);

  return (
    <section className="py-20 md:py-24 bg-surface/20 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Academies"
          title="Top institutions"
          action={
            <RevealOnScroll delay={80}>
              <Link href="/academies">
                <Button variant="outline" size="sm" className="rounded-xl shrink-0">
                  View all
                </Button>
              </Link>
            </RevealOnScroll>
          }
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : academies.length === 0 ? (
          <RevealOnScroll>
            <Card className="text-center py-12 border-border-subtle bg-surface/40">
              <p className="text-text-secondary text-sm">Explore academies.</p>
            </Card>
          </RevealOnScroll>
        ) : (
          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={110}>
            {academies.map((academy, index) => (
              <RevealItem key={academy.id} index={index}>
                <AcademyCard academy={academy} compact />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Voices" title="What people say" />

        <RevealGroup className="grid md:grid-cols-3 gap-4" stagger={120}>
          {TESTIMONIALS.map((t, index) => (
            <RevealItem
              key={t.name}
              index={index}
              className={index % 2 === 0 ? "reveal-item-alt-left" : "reveal-item-alt-right"}
            >
              <Card padding="lg" className="h-full border-border-subtle bg-surface/40">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-white/15 to-white/5 border border-border-subtle flex items-center justify-center text-xs font-semibold text-text-primary">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{t.name}</p>
                    <p className="text-text-tertiary text-xs">{t.role}</p>
                  </div>
                </div>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="cta-reveal">
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface/50">
            <div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-6 py-14 md:px-14 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-3">
                Start today.
              </h2>
              <p className="text-text-secondary text-sm mb-7">Free to join. No card needed.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="min-w-[160px] rounded-xl">Get started</Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="min-w-[160px] rounded-xl">Browse courses</Button>
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
            <div className="col-span-2 md:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
                  <span className="text-text-inverse font-bold">A</span>
                </div>
                <span className="text-lg font-bold text-text-primary tracking-tight">Acadify</span>
              </Link>
              <p className="text-text-tertiary text-xs max-w-xs">Learn anything. Anytime.</p>
            </div>

            <div className="md:col-span-2 md:col-start-7">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="text-text-secondary hover:text-text-primary transition">Courses</Link></li>
                <li><Link href="/academies" className="text-text-secondary hover:text-text-primary transition">Academies</Link></li>
                <li><Link href="/register" className="text-text-secondary hover:text-text-primary transition">Teach</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-text-secondary hover:text-text-primary transition">About</Link></li>
                <li><Link href="/contact" className="text-text-secondary hover:text-text-primary transition">Contact</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-text-secondary hover:text-text-primary transition">Terms</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-text-primary transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </RevealOnScroll>

        <div className="pt-6 border-t border-border-subtle text-center text-text-tertiary text-xs">
          <p>&copy; {new Date().getFullYear()} Acadify</p>
        </div>
      </div>
    </footer>
  );
}

export function HomePageClient() {
  return (
    <div className="min-h-screen bg-background-primary">
      <HomeNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PopularCoursesSection />
      <PopularAcademiesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
