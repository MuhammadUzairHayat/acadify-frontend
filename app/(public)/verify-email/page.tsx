import { Suspense } from "react";
import { Loader } from "@/components/ui/Loader";
import { VerifyEmailPageClient } from "@/components/pages/verify-email/VerifyEmailPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-primary"><Loader size="lg" /></div>}>
      <VerifyEmailPageClient />
    </Suspense>
  );
}
