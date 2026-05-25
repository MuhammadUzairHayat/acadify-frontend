'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Navbar Component
function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-text-inverse font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-text-primary">Acadify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-text-secondary hover:text-text-primary transition">
              Courses
            </Link>
            <Link href="/academies" className="text-text-secondary hover:text-text-primary transition">
              Academies
            </Link>
            <Link href="/about" className="text-text-secondary hover:text-text-primary transition">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-text-primary">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-accent text-sm font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-surface-raised border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link href="/dashboard" className="block px-4 py-2 text-text-secondary hover:bg-background-hover">
                        Dashboard
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-text-secondary hover:bg-background-hover">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-background-hover"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            title={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-text-primary hover:bg-background-hover"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link href="/courses" className="text-text-secondary hover:text-text-primary px-3 py-2">
                Courses
              </Link>
              <Link href="/academies" className="text-text-secondary hover:text-text-primary px-3 py-2">
                Academies
              </Link>
              <Link href="/about" className="text-text-secondary hover:text-text-primary px-3 py-2">
                About
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="text-text-primary px-3 py-2">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-400 px-3 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-text-primary px-3 py-2">
                    Sign In
                  </Link>
                  <Link href="/register" className="text-accent px-3 py-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section Component
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 animate-fade-in">
          Learn Without Limits
          <span className="block bg-linear-to-r from-accent to-secondary bg-clip-text text-transparent">
            Start Your Journey Today
          </span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Join thousands of students learning from top academies and expert tutors worldwide.
          Get access to thousands of courses, live classes, and personalized learning paths.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for courses, academies, or tutors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-36 py-4 text-lg bg-background-secondary border-border"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <Button
              type="submit"
              className="absolute right-1 top-1 bottom-1"
              size="sm"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8">
          <div>
            <div className="text-3xl font-bold text-accent">10K+</div>
            <div className="text-text-secondary">Active Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">500+</div>
            <div className="text-text-secondary">Expert Tutors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">1K+</div>
            <div className="text-text-secondary">Courses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">50+</div>
            <div className="text-text-secondary">Academies</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Diverse Courses',
      description: 'Learn from thousands of courses across various categories and skill levels.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Certified Learning',
      description: 'Earn certificates upon course completion to showcase your skills.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Learn at Your Pace',
      description: 'Access course materials anytime, anywhere with lifetime access.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Expert Instructors',
      description: 'Learn from industry experts and experienced professionals.',
    },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Why Choose Acadify?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            We provide the best learning experience with high-quality content and expert instructors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:border-accent/30 transition-all duration-300">
              <div className="text-accent mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Popular Courses Section
function PopularCoursesSection() {
  const courses = [
    {
      title: 'Web Development Bootcamp',
      instructor: 'Sarah Johnson',
      students: 1245,
      rating: 4.8,
      price: 49.99,
      imageBg: 'bg-blue-500/20',
    },
    {
      title: 'Data Science Masterclass',
      instructor: 'Michael Chen',
      students: 892,
      rating: 4.9,
      price: 59.99,
      imageBg: 'bg-purple-500/20',
    },
    {
      title: 'UI/UX Design Fundamentals',
      instructor: 'Emily Rodriguez',
      students: 2341,
      rating: 4.7,
      price: 39.99,
      imageBg: 'bg-green-500/20',
    },
    {
      title: 'Mobile App Development',
      instructor: 'David Kim',
      students: 1567,
      rating: 4.8,
      price: 54.99,
      imageBg: 'bg-orange-500/20',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Popular Courses
            </h2>
            <p className="text-text-secondary">Most enrolled courses this month</p>
          </div>
          <Link href="/courses">
            <Button variant="outline">View All →</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <Card key={index} className="group hover:border-accent/30 transition-all duration-300 cursor-pointer">
              <div className={`h-40 ${course.imageBg} rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <svg className="h-16 w-16 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-accent transition">
                {course.title}
              </h3>
              <p className="text-text-secondary text-sm mb-2">{course.instructor}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-yellow-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="ml-1 text-text-primary">{course.rating}</span>
                  </div>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-text-tertiary">{course.students} students</span>
                </div>
                <span className="text-accent font-bold">${course.price}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Popular Academies Section
function PopularAcademiesSection() {
  const academies = [
    { name: 'Tech Academy', courses: 124, students: 5234, logoBg: 'bg-blue-500/20' },
    { name: 'Design School', courses: 87, students: 3421, logoBg: 'bg-purple-500/20' },
    { name: 'Business Institute', courses: 156, students: 6789, logoBg: 'bg-green-500/20' },
    { name: 'Language Center', courses: 45, students: 2345, logoBg: 'bg-orange-500/20' },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Top Academies
            </h2>
            <p className="text-text-secondary">Learn from the best institutions</p>
          </div>
          <Link href="/academies">
            <Button variant="outline">View All →</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {academies.map((academy, index) => (
            <Card key={index} className="text-center hover:border-accent/30 transition-all duration-300 cursor-pointer">
              <div className={`w-20 h-20 ${academy.logoBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className="h-10 w-10 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{academy.name}</h3>
              <p className="text-text-secondary text-sm">{academy.courses} Courses</p>
              <p className="text-text-tertiary text-sm">{academy.students} Students</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'John Doe',
      role: 'Student',
      content: 'Acadify transformed my career. The courses are comprehensive and the instructors are amazing!',
      avatarBg: 'bg-blue-500',
    },
    {
      name: 'Jane Smith',
      role: 'Academy Owner',
      content: 'Platform is fantastic for managing my academy and reaching more students worldwide.',
      avatarBg: 'bg-purple-500',
    },
    {
      name: 'Mike Johnson',
      role: 'Course Creator',
      content: 'The best platform for creating and selling courses. Highly recommended!',
      avatarBg: 'bg-green-500',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            What Our Users Say
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Join thousands of satisfied learners and educators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <div className="absolute top-4 right-4 text-4xl text-accent/20">&quot;</div>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 ${testimonial.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary">{testimonial.name}</h4>
                  <p className="text-text-tertiary text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-accent to-secondary opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-text-secondary text-lg mb-8">
          Join Acadify today and get access to thousands of courses, expert instructors, and a community of learners.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" variant="primary">
              Get Started for Free
            </Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline">
              Browse Courses
            </Button>
          </Link>
        </div>
        <p className="text-text-tertiary text-sm mt-6">
          No credit card required. Start learning today!
        </p>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-text-inverse font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-text-primary">Acadify</span>
            </div>
            <p className="text-text-secondary text-sm">
              Empowering education through technology. Learn anything, anytime, anywhere.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Platform</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><Link href="/courses" className="hover:text-accent">Courses</Link></li>
              <li><Link href="/academies" className="hover:text-accent">Academies</Link></li>
              <li><Link href="/become-tutor" className="hover:text-accent">Become a Tutor</Link></li>
              <li><Link href="/pricing" className="hover:text-accent">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Company</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-accent">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><Link href="/terms" className="hover:text-accent">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-accent">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-text-tertiary text-sm">
          <p>&copy; {new Date().getFullYear()} Acadify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PopularCoursesSection />
      <PopularAcademiesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}