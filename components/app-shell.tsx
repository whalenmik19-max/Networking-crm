"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/contacts/new", label: "Add Contact" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isGuestMode, logOut } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">Networking CRM</span>
          <span className="brand-name">Relationship notes for your future self</span>
        </Link>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}

          {currentUser ? (
            <button type="button" className="nav-link nav-button" onClick={logOut}>
              Log out
            </button>
          ) : (
            <Link href="/login" className="nav-link active">
              Log in / Sign up
            </Link>
          )}
        </nav>
      </header>

      {currentUser ? (
        <div className="session-bar">
          <p className="helper-text">
            Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>
      ) : isGuestMode ? (
        <div className="session-bar">
          <p className="helper-text">
            You&apos;re exploring the sample CRM. Create an account to save your own private contacts.
          </p>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}
