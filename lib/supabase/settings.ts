"use client";

import { defaultUserSettings, type UserSettings } from "@/lib/settings";
import { normalizePlan } from "@/lib/plans";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type UserSettingsRow = {
  user_id: string;
  subscription_plan?: string | null;
  notification_email?: string | null;
  notification_phone?: string | null;
  email_notifications?: boolean | null;
  sms_notifications?: boolean | null;
  browser_notifications?: boolean | null;
  weekly_digest?: boolean | null;
};

function mapSettingsRow(row: UserSettingsRow | null): UserSettings {
  if (!row) {
    return defaultUserSettings;
  }

  return {
    subscriptionPlan: normalizePlan(row.subscription_plan),
    notifications: {
      notificationEmail:
        row.notification_email ?? defaultUserSettings.notifications.notificationEmail,
      notificationPhone:
        row.notification_phone ?? defaultUserSettings.notifications.notificationPhone,
      emailNotifications:
        row.email_notifications ?? defaultUserSettings.notifications.emailNotifications,
      smsNotifications:
        row.sms_notifications ?? defaultUserSettings.notifications.smsNotifications,
      browserNotifications:
        row.browser_notifications ??
        defaultUserSettings.notifications.browserNotifications,
      weeklyDigest: row.weekly_digest ?? defaultUserSettings.notifications.weeklyDigest,
    },
  };
}

async function requireUserId() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("We couldn't confirm the signed-in user.");
  }

  if (!user) {
    throw new Error("You need to be signed in to access settings.");
  }

  return user.id;
}

export async function getUserSettings() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("We couldn't load your settings.");
  }

  return mapSettingsRow((data as UserSettingsRow | null) ?? null);
}

export async function updateUserSettings(settings: UserSettings) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: userId,
        subscription_plan: settings.subscriptionPlan,
        notification_email: settings.notifications.notificationEmail,
        notification_phone: settings.notifications.notificationPhone,
        email_notifications: settings.notifications.emailNotifications,
        sms_notifications: settings.notifications.smsNotifications,
        browser_notifications: settings.notifications.browserNotifications,
        weekly_digest: settings.notifications.weeklyDigest,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("We couldn't save your settings.");
  }

  return mapSettingsRow(data as UserSettingsRow);
}
