"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { validateSignupFields } from "@/lib/validation/signup";

function FieldError({ children }) {
  return children ? <p className="mt-1 text-xs text-rose-200">{children}</p> : null;
}

export function SignupForm() {
  const supabase = useMemo(() => createClient(), []);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setErrors({});

    if (!supabase) {
      setMessage({ type: "error", text: "Supabase is not configured. Add values to .env.local." });
      return;
    }

    const validationErrors = validateSignupFields({ fullName, email, password });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage({ type: "error", text: "Fix the highlighted fields and try again." });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?status=signed-up`,
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim() || null,
        },
      },
    });
    setIsSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({ type: "success", text: "Account created. Check your email, then sign in." });
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="py-4">
          <Link href="/login" className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
            Food Delivery
          </Link>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-white">
            Create a customer account
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Customer signup uses the default customer role. Seller and admin access are approved separately.
          </p>
          <Link
            href="/seller/apply"
            className="mt-6 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Apply as seller
          </Link>
        </section>

        <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">Signup</h2>

          {message ? (
            <div
              className={`mt-4 rounded-md border px-4 py-3 text-sm ${
                message.type === "error"
                  ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                  : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <label className="mt-5 block text-sm text-slate-300">
            Full name
            <input
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setErrors((current) => ({ ...current, fullName: null }));
              }}
              aria-invalid={Boolean(errors.fullName)}
              required
              maxLength="120"
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
            <FieldError>{errors.fullName}</FieldError>
          </label>

          <label className="mt-4 block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: null }));
              }}
              aria-invalid={Boolean(errors.email)}
              required
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
            <FieldError>{errors.email}</FieldError>
          </label>

          <label className="mt-4 block text-sm text-slate-300">
            Phone
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
          </label>

          <label className="mt-4 block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: null }));
              }}
              aria-invalid={Boolean(errors.password)}
              required
              minLength="8"
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
            <FieldError>{errors.password}</FieldError>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-300 transition hover:text-emerald-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
