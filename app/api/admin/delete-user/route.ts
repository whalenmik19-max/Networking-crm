import { NextResponse } from "next/server";
import { getAdminConfigHint, isAdminUser } from "@/lib/server/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DeleteUserRequestBody = {
  userId?: string;
};

type DeletionStep =
  | "contacts"
  | "interactions"
  | "reminders"
  | "user_settings"
  | "profiles"
  | "account_deletion_requests"
  | "auth_user";

async function deleteRowsForUser(
  table: string,
  userId: string,
  step: DeletionStep,
  completedSteps: DeletionStep[],
) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);

  if (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete ${table} rows.`,
        code: "partial_deletion_failure",
        failedStep: step,
        completedSteps,
      },
      { status: 500 },
    );
  }

  completedSteps.push(step);
  return null;
}

async function deleteContactChildrenAndContacts(
  userId: string,
  completedSteps: DeletionStep[],
) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: contacts, error: contactLookupError } = await supabaseAdmin
    .from("contacts")
    .select("id")
    .eq("user_id", userId);

  if (contactLookupError) {
    console.error(contactLookupError);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load contact rows for deletion.",
        code: "partial_deletion_failure",
        failedStep: "contacts",
        completedSteps,
      },
      { status: 500 },
    );
  }

  const contactIds = (contacts ?? []).map((contact) => contact.id);

  if (contactIds.length > 0) {
    const { error: interactionsError } = await supabaseAdmin
      .from("interactions")
      .delete()
      .in("contact_id", contactIds);

    if (interactionsError) {
      console.error(interactionsError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete interaction rows.",
          code: "partial_deletion_failure",
          failedStep: "interactions",
          completedSteps,
        },
        { status: 500 },
      );
    }

    completedSteps.push("interactions");

    const { error: remindersError } = await supabaseAdmin
      .from("reminders")
      .delete()
      .in("contact_id", contactIds);

    if (remindersError) {
      console.error(remindersError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete reminder rows.",
          code: "partial_deletion_failure",
          failedStep: "reminders",
          completedSteps,
        },
        { status: 500 },
      );
    }

    completedSteps.push("reminders");
  } else {
    completedSteps.push("interactions");
    completedSteps.push("reminders");
  }

  const { error: contactsError } = await supabaseAdmin
    .from("contacts")
    .delete()
    .eq("user_id", userId);

  if (contactsError) {
    console.error(contactsError);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contact rows.",
        code: "partial_deletion_failure",
        failedStep: "contacts",
        completedSteps,
      },
      { status: 500 },
    );
  }

  completedSteps.push("contacts");
  return null;
}

export async function POST(request: Request) {
  let body: DeleteUserRequestBody;

  try {
    body = (await request.json()) as DeleteUserRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body.",
        code: "invalid_request_body",
      },
      { status: 400 },
    );
  }

  const userId = body.userId?.trim();

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing userId.",
        code: "missing_user_id",
      },
      { status: 400 },
    );
  }

  let callerUserId = "";
  let callerEmail = "";

  try {
    const supabaseServer = await getSupabaseServerClient();
    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseServer.auth.getUser();

    if (callerError) {
      console.error(callerError);
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't verify the signed-in user.",
          code: "auth_verification_failed",
        },
        { status: 401 },
      );
    }

    if (!caller) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be signed in to perform this action.",
          code: "unauthorized",
        },
        { status: 401 },
      );
    }

    callerUserId = caller.id;
    callerEmail = caller.email ?? "";

    if (!isAdminUser(caller)) {
      return NextResponse.json(
        {
          success: false,
          error: "This route is admin-only.",
          code: "admin_required",
          hint: getAdminConfigHint(),
        },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't verify admin access.",
        code: "admin_verification_failed",
      },
      { status: 500 },
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: targetUserData, error: targetUserError } =
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (targetUserError) {
    console.error(targetUserError);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't look up the target user.",
        code: "target_lookup_failed",
      },
      { status: 500 },
    );
  }

  if (!targetUserData.user) {
    return NextResponse.json(
      {
        success: false,
        error: "Target user not found.",
        code: "user_not_found",
      },
      { status: 404 },
    );
  }

  const completedSteps: DeletionStep[] = [];
  const contactDeleteFailure = await deleteContactChildrenAndContacts(userId, completedSteps);

  if (contactDeleteFailure) {
    return contactDeleteFailure;
  }

  const deletionTables: Array<{ table: string; step: DeletionStep }> = [
    { table: "user_settings", step: "user_settings" },
    { table: "profiles", step: "profiles" },
    { table: "account_deletion_requests", step: "account_deletion_requests" },
  ];

  for (const { table, step } of deletionTables) {
    const failedResponse = await deleteRowsForUser(table, userId, step, completedSteps);

    if (failedResponse) {
      return failedResponse;
    }
  }

  const { error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteAuthUserError) {
    console.error(deleteAuthUserError);
    return NextResponse.json(
      {
        success: false,
        error: "Data rows were deleted, but deleting the auth user failed.",
        code: "partial_deletion_failure",
        failedStep: "auth_user",
        completedSteps,
      },
      { status: 500 },
    );
  }

  completedSteps.push("auth_user");

  return NextResponse.json({
    success: true,
    deletedUserId: userId,
    completedSteps,
    performedBy: {
      userId: callerUserId,
      email: callerEmail,
    },
  });
}
