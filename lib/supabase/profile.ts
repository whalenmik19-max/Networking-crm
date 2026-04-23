"use client";

import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizePlan } from "@/lib/plans";
import { defaultUserSettings } from "@/lib/settings";

function buildProfileRow(user: User) {
  const fullName =
    typeof user.user_metadata.name === "string" && user.user_metadata.name.trim().length > 0
      ? user.user_metadata.name.trim()
      : user.email?.split("@")[0] ?? "Keeply user";
  const plan = normalizePlan(user.user_metadata.plan);

  return {
    user_id: user.id,
    full_name: fullName,
    email: user.email ?? "",
    phone: user.phone ?? "",
    plan,
  };
}

function buildDefaultSettingsRow(user: User) {
  const plan = normalizePlan(user.user_metadata.plan);

  return {
    user_id: user.id,
    subscription_plan: plan,
    notification_email: user.email ?? defaultUserSettings.notifications.notificationEmail,
    notification_phone: user.phone ?? defaultUserSettings.notifications.notificationPhone,
    email_notifications: defaultUserSettings.notifications.emailNotifications,
    sms_notifications: defaultUserSettings.notifications.smsNotifications,
    browser_notifications: defaultUserSettings.notifications.browserNotifications,
    weekly_digest: defaultUserSettings.notifications.weeklyDigest,
  };
}

export async function syncProfileRow(user: User) {
  const supabase = getSupabaseBrowserClient();
  const { error: profileError } = await supabase.from("profiles").upsert(
    buildProfileRow(user),
    { onConflict: "user_id" },
  );

  if (profileError) {
    console.error(profileError);
    throw new Error("We couldn't set up your profile.");
  }
}

export async function ensureUserSettingsRow(user: User) {
  const supabase = getSupabaseBrowserClient();
  const { error: settingsError } = await supabase.from("user_settings").upsert(
    buildDefaultSettingsRow(user),
    {
      onConflict: "user_id",
      ignoreDuplicates: true,
    },
  );

  if (settingsError) {
    console.error(settingsError);
    throw new Error("We couldn't set up your settings.");
  }
}

export async function ensureUserRecords(user: User) {
  await syncProfileRow(user);
  await ensureUserSettingsRow(user);
}
