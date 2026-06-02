'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { Enrollment } from '../../../../lib/types';
import { api } from '@/lib/apis';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  isPublished: boolean;
  thumbnail: string | null;
  _count?: {
    enrollments: number;
  };
  enrollments?: Enrollment[];
}

export default function CoursesPage() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    setLoading(true);

    try {
      const response = await api.course.getMy();
      const resolvedCourses = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setCourses(resolvedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCourses();
    }, 0);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void fetchCourses();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await api.course.delete(id);
      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.course.unpublish(id);
      } else {
        await api.course.publish(id);
      }
      await fetchCourses();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update course status');
    }
  };

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
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Courses</h1>
              <p className="text-text-secondary text-sm">Manage your courses</p>
            </div>
            <Link href="/owner/courses/create">
              <Button>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Course
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-8">
        {courses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
              <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No Courses Yet</h2>
            <p className="text-text-secondary mb-6">Create your first course to start selling</p>
            <Link href="/owner/courses/create">
              <Button>Create Course</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:border-accent/30 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">{course.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-text-tertiary">{course.category}</span>
                      <span className="text-text-tertiary">{course.level}</span>
                      <span className="text-text-tertiary">{course._count?.enrollments || 0} students</span>
                      <span className="text-accent font-semibold">{formatCurrency(course.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/owner/courses/${course.id}/settings`}>
                      <Button variant="ghost" size="sm">
                        Settings
                      </Button>
                    </Link>
                    <Link href={`/owner/courses/${course.id}/students`}>
                      <Button variant="ghost" size="sm">
                        Students
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(course.id, course.isPublished)}
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-400"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}