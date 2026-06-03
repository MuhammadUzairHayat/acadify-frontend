"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { api } from "@/lib/apis";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import type { PaymentIntentSession } from "@/lib/types";

type PaymentModalProps = {
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  onClose: () => void;
  onEnrolled: (playUrl: string) => void;
};

function formatAmount(amount: number, currency: string) {
  if (currency.toUpperCase() === "USD") return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}

function CheckoutForm({
  session,
  onClose,
  onEnrolled,
}: {
  session: PaymentIntentSession;
  onClose: () => void;
  onEnrolled: (playUrl: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const pollEnrollment = async (paymentId: string) => {
    setProcessing(true);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const status = await api.payments.getStatus(paymentId);
      if (status.enrolled && status.playUrl) {
        onEnrolled(status.playUrl);
        return;
      }
      if (status.status === "FAILED") {
        throw new Error("Payment failed. Please try again.");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("Payment received. Enrollment is still processing — check My Courses shortly.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Please check your payment details");
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: session.clientSecret,
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment could not be completed");
      }

      if (paymentIntent?.status === "succeeded") {
        await pollEnrollment(session.paymentId);
        return;
      }

      throw new Error("Payment was not completed. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {processing ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader size="sm" />
          Confirming enrollment…
        </div>
      ) : null}

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting || processing}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting || processing} disabled={!stripe || !elements}>
          Pay {formatAmount(session.amount, session.currency)}
        </Button>
      </div>
    </form>
  );
}

export function PaymentModal({
  courseId,
  courseTitle,
  amount,
  currency,
  onClose,
  onEnrolled,
}: PaymentModalProps) {
  const [session, setSession] = useState<PaymentIntentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.payments.createIntent(courseId);
        if (!data.stripeAccountId) {
          throw new Error("Payment setup is incomplete for this academy. Please try again later.");
        }
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start payment");
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [courseId]);

  const stripePromise = useMemo(() => {
    if (!session?.publishableKey || !session.stripeAccountId) return null;
    return loadStripe(session.publishableKey, {
      stripeAccount: session.stripeAccountId,
    });
  }, [session?.publishableKey, session?.stripeAccountId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Complete your purchase</h3>
            <p className="text-sm text-text-secondary mt-1">{courseTitle}</p>
            <p className="text-lg font-semibold text-text-primary mt-2">
              {formatAmount(amount, currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : session && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: session.clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#ffffff",
                  colorBackground: "#171717",
                  colorText: "#fafafa",
                  colorDanger: "#f87171",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutForm session={session} onClose={onClose} onEnrolled={onEnrolled} />
          </Elements>
        ) : null}
      </Card>
    </div>
  );
}
