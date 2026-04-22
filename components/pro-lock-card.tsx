"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { UpgradeButton } from "@/components/upgrade-button";

type ProLockCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function ProLockCard({
  eyebrow = "Pro feature",
  title,
  description,
}: ProLockCardProps) {
  const { currentUser } = useAuth();

  return (
    <div className="pro-lock-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p className="section-copy">{description}</p>
      <div className="pro-lock-actions">
        {currentUser ? (
          <UpgradeButton />
        ) : (
          <>
            <Link href="/signup" className="button button-primary">
              Create an account
            </Link>
            <UpgradeButton
              className="button button-secondary"
              label="See what Pro unlocks"
            />
          </>
        )}
      </div>
    </div>
  );
}
