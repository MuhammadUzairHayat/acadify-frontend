"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { resolvePostLoginPath } from "@/lib/auth";
import type { UserRole } from "@/lib/types";
import { apiFetch } from "@/lib/fetch-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const role = data.data.user.role as UserRole;
        router.push(resolvePostLoginPath(role, redirectParam));
        router.refresh();
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-text-secondary mt-2">
          Sign in to continue your learning journey
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:text-accent-muted"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-6">
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-accent hover:text-accent-muted font-medium"
          >
            Create Account
          </Link>
        </p>
      </div>
    </Card>
  );
}
