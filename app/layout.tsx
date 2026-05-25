import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Acadify - Online Learning Platform',
  description: 'Connect with top academies and tutors. Learn anything, anytime, anywhere.',
  keywords: 'online learning, courses, education, academies, tutoring',
  authors: [{ name: 'Acadify' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background-primary text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  );
}