import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary">
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="font-bold text-text-primary">
              Acadify Admin
            </Link>
          </div>
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Exit admin
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
