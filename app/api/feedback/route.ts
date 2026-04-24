import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type FeedbackRequestBody = {
  category?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: FeedbackRequestBody;

  try {
    body = (await request.json()) as FeedbackRequestBody;
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

  const category = body.category?.trim() || "general";
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      {
        success: false,
        error: "Feedback message is required.",
        code: "missing_message",
      },
      { status: 400 },
    );
  }

  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    const supabaseServer = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser();

    if (error) {
      console.error(error);
    } else if (user) {
      userId = user.id;
      userEmail = user.email ?? null;
    }
  } catch (sessionError) {
    console.error(sessionError);
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { error: insertError } = await supabaseAdmin.from("feedback_submissions").insert({
    category,
    message,
    user_id: userId,
    user_email: userEmail,
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      {
        success: false,
        error: insertError.message || "We couldn't send your feedback right now.",
        code: "feedback_insert_failed",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
