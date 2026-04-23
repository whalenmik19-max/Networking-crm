"use client";

import type { Interaction, NewInteraction } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type InteractionRow = {
  id: string;
  user_id?: string;
  contact_id?: string;
  date?: string;
  type?: Interaction["type"];
  notes?: string | null;
};

function mapInteractionRow(row: InteractionRow): Interaction {
  return {
    id: row.id,
    date: row.date ?? "",
    type: row.type ?? "other",
    notes: row.notes ?? "",
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
    throw new Error("You need to be signed in to access interactions.");
  }

  return user.id;
}

export async function getInteractions(contactId: string) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("user_id", userId)
    .eq("contact_id", contactId)
    .order("date", { ascending: false });

  if (error) {
    throw new Error("We couldn't load interactions for this contact.");
  }

  return (data ?? []).map((row: unknown) => mapInteractionRow(row as InteractionRow));
}

export async function addInteraction(contactId: string, interaction: NewInteraction) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("interactions")
    .insert({
      user_id: userId,
      contact_id: contactId,
      date: interaction.date,
      type: interaction.type,
      notes: interaction.notes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("We couldn't save this interaction.");
  }

  return mapInteractionRow(data as InteractionRow);
}

export async function deleteInteraction(interactionId: string) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { error } = await supabase
    .from("interactions")
    .delete()
    .eq("id", interactionId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("We couldn't delete this interaction.");
  }
}
