"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AccountDeletionRequest } from "@/lib/settings";

const deletionRequestsTable = "account_deletion_requests";

type AccountDeletionRequestRow = {
  id: string;
  user_id: string;
  status: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
};

function mapDeletionRequestRow(
  row: AccountDeletionRequestRow | null,
): AccountDeletionRequest | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status ?? "pending",
    requestedAt: row.requested_at ?? "",
    reviewedAt: row.reviewed_at,
    reviewNotes: row.review_notes,
  };
}

async function requireUserId() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(error);
    throw new Error("We couldn't confirm the signed-in user.");
  }

  if (!user) {
    throw new Error("You need to be signed in to manage deletion requests.");
  }

  return user.id;
}

export async function getLatestDeletionRequest() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from(deletionRequestsTable)
    .select("id, user_id, status, requested_at, reviewed_at, review_notes")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("We couldn't load your deletion request.");
  }

  return mapDeletionRequestRow((data as AccountDeletionRequestRow | null) ?? null);
}

export async function submitDeletionRequest() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId();
  const requestedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from(deletionRequestsTable)
    .insert({
      user_id: userId,
      status: "pending",
      requested_at: requestedAt,
      reviewed_at: null,
      review_notes: null,
    })
    .select("id, user_id, status, requested_at, reviewed_at, review_notes")
    .single();

  if (error) {
    console.error(error);
    throw new Error("We couldn't submit your deletion request.");
  }

  return mapDeletionRequestRow(data as AccountDeletionRequestRow);
}
