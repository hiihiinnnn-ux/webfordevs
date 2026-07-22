"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/guide", label: "Guide" },
  { href: "/api-docs", label: "API" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.user as User;
      })
      .then((nextUser) => {
        if (!cancelled) setUser(nextUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          Ember
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {!loaded ? (
            <span className="muted small">…</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="text-link">
                {user.name}
              </Link>
              <button type="button" className="btn ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-link">
                Log in
              </Link>
              <Link href="/register" className="btn primary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
