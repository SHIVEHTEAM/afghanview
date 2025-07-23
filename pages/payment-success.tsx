import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";

export default function PaymentSuccess() {
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setResent(false);
    try {
      const res = await fetch("/api/auth/resend-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResent(true);
      } else {
        setError(data.error || "Failed to resend magic link");
      }
    } catch (err) {
      setError("Failed to resend magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Payment Successful - Shivehview</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50 to-purple-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-700 mb-4">
            Thank you for your purchase. We’ve received your payment.
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-500" />
            <span className="text-gray-800 font-medium">
              Please check your email for a magic link to activate your account
              and continue onboarding.
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Didn’t get the email? It may take a minute to arrive. Be sure to
            check your spam folder.
          </p>
          <div className="mb-4">
            <input
              type="email"
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Enter your email to resend magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-60 w-full"
              onClick={handleResend}
              disabled={loading || !email}
            >
              {resent
                ? "Magic link resent!"
                : loading
                ? "Resending..."
                : "Resend magic link"}
            </button>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            {resent && !error && (
              <div className="text-green-600 text-sm mt-2">
                Magic link sent! Please check your inbox.
              </div>
            )}
          </div>
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:underline text-sm"
            >
              Already have the link? Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
