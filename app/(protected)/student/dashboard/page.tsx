'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void loadProfile();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Navbar */}
      <nav className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-text-primary">Acadify</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-secondary">Welcome, {user?.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary mt-1">Welcome to your Acadify dashboard</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>
          <div className="space-y-2">
            <p className="text-text-secondary">
              <span className="font-medium text-text-primary">Name:</span> {user?.name}
            </p>
            <p className="text-text-secondary">
              <span className="font-medium text-text-primary">Email:</span> {user?.email}
            </p>
            <p className="text-text-secondary">
              <span className="font-medium text-text-primary">Role:</span> {user?.role}
            </p>
          </div>
        </Card>

        {/* Protected content - only verified users can see this */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">📚 My Courses</h3>
            <p className="text-text-secondary">Your enrolled courses will appear here</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-2">🎯 Learning Progress</h3>
            <p className="text-text-secondary">Track your learning journey</p>
          </Card>
        </div>
      </div>
    </div>
  );
}