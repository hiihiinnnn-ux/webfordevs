import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="shell auth-shell">
      <div className="auth-panel">
        <h1>Welcome back</h1>
        <p className="muted">
          Log in to bookmark tools and models. Demo account:{" "}
          <code>dev@ember.local</code> / <code>password123</code>
        </p>
        <AuthForm mode="login" />
        <p className="muted small" style={{ marginTop: "1rem" }}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
