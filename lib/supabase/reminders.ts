"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type Reminder = {
  id: string;
  contactId: string;
  remindAt: string;
};

type ReminderRow = {
  id: string;
  user_id?: string;
  contact_id?: string;
  remind_at?: string;
};

function mapReminderRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    contactId: row.contact_id ?? "",
    remindAt: row.remind_at ?? "",
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
    throw new Error("You need to be signed in to access reminders.");
  }

  return user.id;
}

export async function getReminders() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("remind_at", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("We couldn't load your reminders.");
  }

  return (data ?? []).map((row: unknown) => mapReminderRow(row as ReminderRow));
}

export async function addReminder(contactId: string, remindAt: string) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: userId,
      contact_id: contactId,
      remind_at: remindAt,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("We couldn't save this reminder.");
  }

  return mapReminderRow(data as ReminderRow);
}

export async function deleteReminder(reminderId: string) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminderId)
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    throw new Error("We couldn't delete this reminder.");
  }
}
