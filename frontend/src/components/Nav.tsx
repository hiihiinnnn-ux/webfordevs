"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Nav() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <Link href={href} className={pathname === href ? "active" : ""}>
      {label}
    </Link>
  );

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="logo">
          ◈ <span>LocalAI</span> Dev
        </Link>
        <ul className="nav-links">
          <li>{link("/search", "Search")}</li>
          <li>{link("/tools", "Tools")}</li>
          <li>{link("/models", "Models")}</li>
          <li>{link("/guides", "Guides")}</li>
        </ul>
        <div className="nav-actions">
          {!loading && user ? (
            <>
              <Link href="/dashboard">{user.display_name || user.username}</Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
