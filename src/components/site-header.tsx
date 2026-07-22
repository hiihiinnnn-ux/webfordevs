"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/guides", label: "Guides" },
  { href: "/api-docs", label: "API" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">Localbench</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {loading ? (
            <span className="muted tiny">…</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                @{user.username}
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
