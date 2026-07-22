import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="shell auth-shell">
      <div className="auth-panel">
        <h1>Create your Ember account</h1>
        <p className="muted">
          Save bookmarks and track the local stack you are building around.
        </p>
        <AuthForm mode="register" />
        <p className="muted small" style={{ marginTop: "1rem" }}>
          Already joined? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
