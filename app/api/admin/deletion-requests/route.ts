import { NextResponse } from "next/server";
import { getAdminConfigHint, isAdminUser } from "@/lib/server/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
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
          error: "You must be signed in to view deletion requests.",
          code: "unauthorized",
        },
        { status: 401 },
      );
    }

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

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("id, user_id, name, email, status, requested_at, reviewed_at, review_notes")
      .order("requested_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't load deletion requests.",
          code: "deletion_request_load_failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      requests: data ?? [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't load the admin queue.",
        code: "admin_queue_failed",
      },
      { status: 500 },
    );
  }
}
