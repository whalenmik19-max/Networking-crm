"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const authRoutes = new Set(["/login", "/signup"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (currentUser && authRoutes.has(pathname)) {
      router.replace("/");
    }
  }, [currentUser, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Loading</p>
          <h1>Opening your workspace...</h1>
          <p className="section-copy">
            We&apos;re checking your saved session and preparing your contacts.
          </p>
        </div>
      </div>
    );
  }

  if (currentUser && authRoutes.has(pathname)) {
    return null;
  }

  return <>{children}</>;
}
