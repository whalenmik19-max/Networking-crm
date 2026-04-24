"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { logIn, signUp } = useAuth();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });

  function updateField(name: keyof typeof formState, value: string) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const result =
      mode === "signup"
        ? await signUp(formState)
        : await logIn({
            email: formState.email,
            password: formState.password,
          });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    if (mode === "signup" && result.requiresEmailConfirmation) {
      setSuccessMessage(
        "Check your email to confirm your account, then come back and login.",
      );
      return;
    }

    router.replace("/");
  }

  return (
    <div className="auth-wrapper">
      <section className="auth-card">
        <div className="auth-copy">
          <Link href="/" className="text-link auth-back-link">
            Back to Keeply
          </Link>
          <p className={`eyebrow ${mode === "login" ? "auth-mode-label" : ""}`}>
            {mode === "signup" ? "Sign up" : "Login"}
          </p>
          <h1>
            {mode === "signup"
              ? "Create your Keeply account"
              : "Welcome back to Keeply"}
          </h1>
          <p className="section-copy">
            {mode === "signup"
              ? "Create an account to save your own contacts, interactions, and follow-up reminders."
              : "Login to see your own contacts and pick up where you left off."}
          </p>
        </div>

        <form className="form-panel auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Jordan Lee"
              />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="jordan@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={formState.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Create a simple password"
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          {successMessage ? <p className="helper-text">{successMessage}</p> : null}

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {mode === "signup" ? "Create account" : "Login"}
            </button>
          </div>

          {mode === "signup" ? (
            <p className="helper-text">
              Already have an account? <Link href="/login">Login</Link>
            </p>
          ) : (
            <div className="auth-switch">
              <p className="helper-text">Need an account first?</p>
              <Link href="/signup" className="button button-secondary">
                Go to sign up
              </Link>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
