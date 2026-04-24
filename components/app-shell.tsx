"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LogoMark } from "@/components/logo-mark";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isGuestMode, logOut } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/contacts", label: "Contacts" },
    { href: "/pricing", label: "Pricing" },
    { href: "/feedback", label: "Feedback" },
    ...(currentUser ? [{ href: "/settings", label: "Settings" }] : []),
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/" className="brand">
          <LogoMark />
          <span className="brand-mark">Keeply</span>
        </Link>

        <div className={`header-actions ${isMobileMenuOpen ? "is-open" : ""}`}>
          <div className="mobile-header-actions">
            <Link
              href="/contacts/new"
              className={`header-primary-action mobile-primary-action ${
                pathname === "/contacts/new" ? "is-active" : ""
              }`}
            >
              + Add Contact
            </Link>

            <button
              type="button"
              className="mobile-menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls="main-navigation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <nav id="main-navigation" className="nav" aria-label="Main navigation">
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
          </nav>

          <Link
            href="/contacts/new"
            className={`header-primary-action desktop-primary-action ${
              pathname === "/contacts/new" ? "is-active" : ""
            }`}
          >
            + Add Contact
          </Link>

          {currentUser ? (
            <button
              type="button"
              className="nav-auth-button nav-auth-button-muted"
              onClick={logOut}
            >
              Log out
            </button>
          ) : (
            <Link href="/login" className="nav-auth-button">
              Login/Sign Up
            </Link>
          )}
        </div>
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
            Demo mode: changes won&apos;t be saved to an account. Create an account to save your contacts privately.
          </p>
        </div>
      ) : null}

      <main>{children}</main>
    </div>
  );
}
