import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const [email, setEmail] = useState(params.get("email") || "");
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    axios.post("auth/verify-email", { token })
      .then((response) => {
        if (!cancelled) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully.");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(error.response?.data?.message || "This verification link is invalid or expired. Request a new one below.");
        }
      });
    return () => { cancelled = true; };
  }, [token]);

  const resend = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Enter a valid email address.");
      setStatus("error");
      return;
    }
    setSending(true);
    try {
      const response = await axios.post("auth/resend-verification", { email: email.trim() });
      setMessage(response.data.message || "Check your inbox if this email belongs to an unverified account.");
      setStatus("sent");
    } catch {
      setMessage("We could not process the request. Please try again shortly.");
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  const success = status === "success";
  return (
    <main className="min-h-[65vh] bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">
          {success ? "✓" : "✉"}
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Travelco account security</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          {status === "verifying" ? "Verifying your email…" : success ? "Email verified" : "Verify your email address"}
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          {status === "verifying"
            ? "Please keep this page open while we check your verification link."
            : success
              ? message
              : message || "We sent a verification link to your inbox when you created your account. Links expire after 24 hours."}
        </p>
        {!success && status !== "verifying" && (
          <form className="mt-8 space-y-4" onSubmit={resend}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="verification-email">Email address</label>
            <input
              id="verification-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : "Resend verification email"}
            </button>
          </form>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
          <Link to="/login" className="font-semibold text-blue-700 hover:underline">Back to sign in</Link>
          <Link to="/register" className="text-slate-600 hover:underline">Create an account</Link>
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-500">For your security, we do not disclose whether an email address has an account.</p>
      </section>
    </main>
  );
};

export default VerifyEmail;
