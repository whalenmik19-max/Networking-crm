export const plans = ["free", "pro"] as const;

export type Plan = (typeof plans)[number];

export const proFeatureLabels = {
  aiFollowUps: "AI-powered suggested follow-ups",
  conversationPrep: "Prepare for your next conversation insights",
  smartReminders: "Smart reminders",
  prioritySorting: "Priority sorting",
} as const;

export function normalizePlan(value: unknown): Plan {
  return value === "pro" ? "pro" : "free";
}

export function isProPlan(plan: Plan | undefined | null) {
  return plan === "pro";
}
