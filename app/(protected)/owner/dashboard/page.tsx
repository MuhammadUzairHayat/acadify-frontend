'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { Course, Enrollment, User as FrontendUser } from '@/lib/types';
import { api } from '@/lib/apis';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

interface Academy {
  id: string;
  name: string;
  slug: string;
  isApproved: boolean;
  isVerified: boolean;
  logo: string | null;
}

interface RecentEnrollment {
  id: string;
  enrolledAt: string;
  student: { name: string; email: string };
  course: { title: string; price: number };
}

export default function OwnerDashboard() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const initialUser = (() => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as FrontendUser;
    } catch {
      return null;
    }
  })();

  const user = initialUser;
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const [statsData, academyData] = await Promise.all([
        api.academy.getStats(),
        api.academy.getMy(),
      ]);
      
      if (statsData) {
        setStats(statsData.stats || statsData);
      }
      if (academyData) {
        setAcademy(academyData);
      }
      
      // Fetch recent enrollments if academy exists
      if (academyData?.id) {
        const coursesData = (await api.course.getMy()) as Course[] | undefined;
        if (coursesData && Array.isArray(coursesData)) {
          const allEnrollments = coursesData.flatMap((course: Course) =>
            (course.enrollments || []).map((enrollment: Enrollment) => ({
              ...enrollment,
              course: { title: course.title, price: course.price },
            })),
          );
          const sorted = allEnrollments.sort((a, b) => 
            new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
          );
          setRecentEnrollments(sorted.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void fetchDashboardData();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
              <p className="text-text-secondary text-sm">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {academy && !academy.isApproved && (
                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Approval
                </div>
              )}
              <Link href="/owner/academy/edit">
                <Button variant="outline" size="sm">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Academy Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalCourses}</p>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Students</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/owner/courses/create">
            <Card className="hover:border-accent/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition">
                  <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Create New Course</h3>
                  <p className="text-text-secondary text-sm">Add a new course to your academy</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/owner/courses">
            <Card className="hover:border-accent/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Manage Courses</h3>
                  <p className="text-text-secondary text-sm">Edit, publish, or unpublish courses</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Enrollments */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Enrollments</h2>
            <Link href="/owner/students">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          
          {recentEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No enrollments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-text-secondary font-medium">Student</th>
                    <th className="text-left py-3 text-text-secondary font-medium">Course</th>
                    <th className="text-left py-3 text-text-secondary font-medium">Amount</th>
                    <th className="text-left py-3 text-text-secondary font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-border hover:bg-background-hover transition">
                      <td className="py-3">
                        <div>
                          <p className="text-text-primary font-medium">{enrollment.student.name}</p>
                          <p className="text-text-tertiary text-sm">{enrollment.student.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-text-primary">{enrollment.course.title}</td>
                      <td className="py-3 text-text-primary">{formatCurrency(enrollment.course.price)}</td>
                      <td className="py-3 text-text-tertiary text-sm">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}