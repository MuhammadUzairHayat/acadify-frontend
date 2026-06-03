import OwnerSidebar from '@/components/owner/Sidebar';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary flex">
      <OwnerSidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}