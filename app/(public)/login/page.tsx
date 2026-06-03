import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader } from "@/components/ui/Loader";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
      <Suspense fallback={<Loader size="lg" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
