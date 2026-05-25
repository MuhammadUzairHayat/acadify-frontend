import OwnerSidebar from '@/components/owner/Sidebar';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary flex">
      <OwnerSidebar />
      <div className="flex-1 ml-64">{children}</div>
    </div>
  );
}