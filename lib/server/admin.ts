import "server-only";

import type { User } from "@supabase/supabase-js";

function parseCsv(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAdminUser(user: User) {
  const allowedUserIds = parseCsv(process.env.ADMIN_USER_IDS);
  const allowedEmails = parseCsv(process.env.ADMIN_EMAILS).map((email) => email.toLowerCase());

  if (allowedUserIds.length === 0 && allowedEmails.length === 0) {
    return false;
  }

  const userEmail = (user.email ?? "").toLowerCase();

  return allowedUserIds.includes(user.id) || allowedEmails.includes(userEmail);
}

export function getAdminConfigHint() {
  return "Set ADMIN_USER_IDS or ADMIN_EMAILS in your server environment to authorize admin deletion requests.";
}
