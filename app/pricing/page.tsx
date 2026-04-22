"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { isProPlan } from "@/lib/plans";

const freeFeatures = [
  { label: "Unlimited contacts", included: true },
  { label: "Basic notes", included: true },
  { label: "Manual follow-up dates", included: true },
  { label: "AI-powered suggested follow-ups", included: false },
  { label: "Prepare for your next conversation insights", included: false },
  { label: "Smart reminders", included: false },
  { label: "Priority sorting of contacts", included: false },
];

const proFeatures = [
  { label: "Unlimited contacts", included: true },
  { label: "Basic notes", included: true },
  { label: "Manual follow-up dates", included: true },
  { label: "AI-powered suggested follow-ups", included: true },
  { label: "Prepare for your next conversation insights", included: true },
  { label: "Smart reminders", included: true },
  { label: "Priority sorting of contacts", included: true },
];

type FeatureListProps = {
  items: Array<{ label: string; included: boolean }>;
  tone: "light" | "dark";
};

function FeatureList({ items, tone }: FeatureListProps) {
  return (
    <ul className={`pricing-feature-list pricing-feature-list-${tone}`}>
      {items.map((item) => (
        <li key={item.label} className={!item.included ? "pricing-feature-muted" : ""}>
          <span className={`pricing-feature-icon ${item.included ? "is-included" : "is-locked"}`}>
            {item.included ? "✓" : "—"}
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const { currentUser, setPlan } = useAuth();
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const currentPlan = currentUser?.plan ?? "free";

  async function handlePlanChange(plan: "free" | "pro") {
    if (!currentUser) {
      setStatus("Create an account first to choose a plan.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const result = await setPlan(plan);

    setIsSaving(false);

    if (!result.success) {
      setStatus(result.error ?? "We couldn't update your plan.");
      return;
    }

    setStatus(plan === "pro" ? "You're now on Pro." : "You're back on the Free plan.");
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header-content-block">
          <p className="eyebrow">Pricing</p>
          <h1 className="page-header-title-nowrap">Choose the version of Keeply that fits you</h1>
          <p className="section-copy pricing-header-copy">
            Start free with the essentials, then upgrade when you want smarter follow-up
            help and richer conversation prep.
          </p>
        </div>
      </section>

      {status ? (
        <section className="content-panel">
          <p className="helper-text">{status}</p>
        </section>
      ) : null}

      <section className="pricing-showcase">
        <article className="pricing-plan pricing-plan-free">
          <div className="pricing-plan-copy">
            <p className="pricing-plan-label">Free</p>
            <div className="pricing-price-stack">
              <h2>$0</h2>
            </div>
            <p className="pricing-plan-description">
              Start using Keeply with no commitment.
            </p>
          </div>

          <FeatureList items={freeFeatures} tone="light" />

          <button
            type="button"
            className="button pricing-plan-button pricing-plan-button-light"
            disabled={isSaving || currentPlan === "free"}
            onClick={() => handlePlanChange("free")}
          >
            {currentPlan === "free" ? "Current plan" : "Get started"}
          </button>
        </article>

        <article className="pricing-plan pricing-plan-pro">
          <div className="pricing-plan-copy">
            <p className="pricing-plan-label pricing-plan-label-featured">Most popular</p>
            <p className="pricing-plan-name">Pro</p>
            <div className="pricing-price-stack pricing-price-stack-pro">
              <h2>$12</h2>
              <span>/month</span>
            </div>
            <p className="pricing-plan-description pricing-plan-description-pro">
              Smarter follow-up help for students and early-career professionals who want
              more signal and less guesswork.
            </p>
          </div>

          <FeatureList items={proFeatures} tone="dark" />

          <button
            type="button"
            className="button pricing-plan-button pricing-plan-button-dark"
            disabled={isSaving || isProPlan(currentPlan)}
            onClick={() => handlePlanChange("pro")}
          >
            {isProPlan(currentPlan) ? "Current plan" : "Upgrade to Pro"}
          </button>
        </article>
      </section>

      <section className="content-panel">
        <p className="eyebrow">Later</p>
        <h2>Real billing can plug in here later</h2>
        <p className="section-copy">
          This page still simulates upgrades by updating the user plan in Supabase. When
          you add Stripe later, this is the right place to swap the Pro button into a
          checkout flow.
        </p>
      </section>
    </div>
  );
}
