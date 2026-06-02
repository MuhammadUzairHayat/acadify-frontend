"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const resendDelaySeconds = 10;

  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error" | "resending"
  >(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(emailParam || "");
  const [resendCountdown, setResendCountdown] = useState(resendDelaySeconds);

  const canResend = resendCountdown === 0 && status !== "resending";

  useEffect(() => {
    if (resendCountdown === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setResendCountdown((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [resendCountdown]);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus("verifying");

    try {
      const response = await fetch("http://localhost:3001/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setMessage(data.message);

        // Clear stored email
        localStorage.removeItem("pendingVerificationEmail");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(
          data.message ||
            "Verification failed. The link may be expired or invalid.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      const timeoutId = window.setTimeout(() => {
        void verifyEmail(token);
      }, 0);

      const handlePageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
          void verifyEmail(token);
        }
      };

      window.addEventListener('pageshow', handlePageShow);

      return () => {
        window.clearTimeout(timeoutId);
        window.removeEventListener('pageshow', handlePageShow);
      };
    }
  }, [token, verifyEmail]);


  const resendVerification = async () => {
    if (!canResend) {
      return;
    }

    if (!email) {
      const storedEmail = localStorage.getItem("pendingVerificationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setMessage(
          "Please provide your email address to resend the verification link.",
        );
        return;
      }
    }

    setStatus("resending");

    try {
      const response = await fetch(
        "http://localhost:3001/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Verification email resent! Please check your inbox.");
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
        <Card className="max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <Loader size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Verifying Your Email
          </h2>
          <p className="text-text-secondary">
            Please wait while we verify your email address...
          </p>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
        <Card className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-500/10 mb-5">
            <svg
              className="h-7 w-7 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Email Verified! 🎉
          </h2>
          <p className="text-text-secondary mb-5">{message}</p>
          <p className="text-text-tertiary text-sm">
            Redirecting to login page...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 mb-4">
            <svg
              className="h-7 w-7 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Verify Your Email
          </h1>
          <p className="text-text-secondary mt-2">
            {token
              ? "We encountered an issue verifying your email"
              : "Check your inbox for the verification link"}
          </p>
        </div>

        {message && (
          <div
            className={`mb-5 p-3 rounded-lg text-sm ${
              message.includes("resent")
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {!token && (
          <>
            <p className="text-text-secondary text-sm mb-5 text-center">
              We&apos;ve sent a verification email to{" "}
              <strong className="text-text-primary">
                {email || "your email address"}
              </strong>
            </p>
            <div className="space-y-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={resendVerification}
                fullWidth
                loading={status === "resending"}
                disabled={!canResend}
              >
                {canResend
                  ? "Resend Verification Email"
                  : `Resend available in ${resendCountdown}s`}
              </Button>
            </div>
          </>
        )}

        {token && status === "error" && (
          <>
            <div className="space-y-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={resendVerification}
                fullWidth
                variant="outline"
                loading={false}
                disabled={!canResend}
              >
                {canResend
                  ? "Request New Verification Link"
                  : `Request available in ${resendCountdown}s`}
              </Button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-accent hover:text-accent-muted text-sm"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-primary p-4">
          <Card className="max-w-md w-full text-center">
            <div className="flex justify-center mb-5">
              <Loader size="lg" />
            </div>
            <div className="text-text-secondary text-sm">Loading…</div>
          </Card>
        </div>
      }
    >
      <VerifyEmailPageInner />
    </Suspense>
  );
}
