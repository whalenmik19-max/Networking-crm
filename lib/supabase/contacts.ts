"use client";

import type { Contact, NewContact } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ContactRow = {
  id: string;
  user_id?: string;
  name?: string;
  company?: string | null;
  role?: string | null;
  email?: string | null;
  phone_number?: string | null;
  school?: string | null;
  date_met?: string | null;
  where_we_met?: string | null;
  relationship_type?: string | null;
  priority?: string | null;
  notes?: string | null;
  next_follow_up_date?: string | null;
};

function mapContactRow(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name ?? "",
    company: row.company ?? "",
    role: row.role ?? "",
    email: row.email ?? "",
    phoneNumber: row.phone_number ?? "",
    school: row.school ?? "",
    dateMet: row.date_met ?? "",
    whereWeMet: row.where_we_met ?? "",
    relationshipType: row.relationship_type ?? "",
    priority:
      row.priority === "High Priority" ||
      row.priority === "Warm Connection" ||
      row.priority === "Needs Attention"
        ? row.priority
        : "Needs Attention",
    notes: row.notes ?? "",
    nextFollowUpDate: row.next_follow_up_date ?? "",
    reminderAt: "",
    tags: [],
    interactions: [],
  };
}

function toContactRow(contact: NewContact, userId: string) {
  return {
    user_id: userId,
    name: contact.name,
    company: contact.company,
    role: contact.role,
    email: contact.email,
    phone_number: contact.phoneNumber,
    school: contact.school,
    date_met: contact.dateMet || null,
    where_we_met: contact.whereWeMet,
    relationship_type: contact.relationshipType,
    priority: contact.priority,
    notes: contact.notes,
    next_follow_up_date: contact.nextFollowUpDate || null,
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
    throw new Error("You need to be signed in to access contacts.");
  }

  return user.id;
}

export async function getContacts() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("We couldn't load your contacts.");
  }

  return (data ?? []).map((row: unknown) => mapContactRow(row as ContactRow));
}

export async function addContact(contact: NewContact) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("contacts")
    .insert(toContactRow(contact, userId))
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("We couldn't save this contact.");
  }

  return mapContactRow(data as ContactRow);
}

export async function updateContact(contactId: string, updates: Partial<NewContact>) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("contacts")
    .update({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.company !== undefined ? { company: updates.company } : {}),
      ...(updates.role !== undefined ? { role: updates.role } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
      ...(updates.phoneNumber !== undefined ? { phone_number: updates.phoneNumber } : {}),
      ...(updates.school !== undefined ? { school: updates.school } : {}),
      ...(updates.dateMet !== undefined ? { date_met: updates.dateMet || null } : {}),
      ...(updates.whereWeMet !== undefined ? { where_we_met: updates.whereWeMet } : {}),
      ...(updates.relationshipType !== undefined
        ? { relationship_type: updates.relationshipType }
        : {}),
      ...(updates.priority !== undefined ? { priority: updates.priority } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      ...(updates.nextFollowUpDate !== undefined
        ? { next_follow_up_date: updates.nextFollowUpDate || null }
        : {}),
    })
    .eq("id", contactId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("We couldn't update this contact.");
  }

  return mapContactRow(data as ContactRow);
}

export async function deleteContact(contactId: string) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    throw new Error("We couldn't delete this contact.");
  }
}
