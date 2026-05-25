'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { api } from '@/lib/apis';

interface FormData {
  name: string;
  description: string;
  city: string;
  address: string;
  logo: string;
  banner: string;
}

export default function EditAcademyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasAcademy, setHasAcademy] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    city: '',
    address: '',
    logo: '',
    banner: '',
  });

  const fetchExistingAcademy = async () => {
    setLoading(true);

    try {
      const data = await api.academy.getMy();
      if (data) {
        setHasAcademy(true);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          city: data.city || '',
          address: data.address || '',
          logo: data.logo || '',
          banner: data.banner || '',
        });
      }
    } catch {
      // No academy exists yet, that's fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchExistingAcademy();
    }, 0);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void fetchExistingAcademy();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (hasAcademy) {
        await api.academy.update(formData);
      } else {
        await api.academy.create(formData);
      }
      router.push('/owner/academy');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save academy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
          <h1 className="text-2xl font-bold text-text-primary">
            {hasAcademy ? 'Edit Academy' : 'Create Academy'}
          </h1>
          <p className="text-text-secondary text-sm">
            {hasAcademy ? 'Update your academy information' : 'Set up your academy to start offering courses'}
          </p>
        </div>
      </header>

      <div className="p-8 max-w-3xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Academy Name"
              name="name"
              placeholder="e.g., Tech Academy, Design School"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe your academy, mission, and what you offer..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                required
              />
            </div>

            <Input
              label="City"
              name="city"
              placeholder="e.g., New York, London, Remote"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <Input
              label="Address (Optional)"
              name="address"
              placeholder="Full address or 'Online Only'"
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              label="Logo URL (Optional)"
              name="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={handleChange}
            />

            <Input
              label="Banner URL (Optional)"
              name="banner"
              type="url"
              placeholder="https://example.com/banner.png"
              value={formData.banner}
              onChange={handleChange}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
              >
                {hasAcademy ? 'Update Academy' : 'Create Academy'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}