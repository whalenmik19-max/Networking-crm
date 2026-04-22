import { NextResponse } from "next/server";

type FeedbackRequest = {
  category?: string;
  message?: string;
};

const allowedCategories = new Set(["general", "bug", "feature", "design"]);

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const feedbackToEmail = process.env.FEEDBACK_TO_EMAIL;
  const feedbackFromEmail =
    process.env.FEEDBACK_FROM_EMAIL ?? "Keeply Feedback <onboarding@resend.dev>";

  if (!resendApiKey || !feedbackToEmail) {
    return NextResponse.json(
      {
        error:
          "Feedback email is not configured yet. Add RESEND_API_KEY and FEEDBACK_TO_EMAIL on the server.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as FeedbackRequest;
  const category = allowedCategories.has(body.category ?? "")
    ? body.category ?? "general"
    : "general";
  const message = body.message?.trim() ?? "";

  if (!message) {
    return NextResponse.json(
      { error: "Please include feedback before sending." },
      { status: 400 },
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: feedbackFromEmail,
      to: [feedbackToEmail],
      subject: `Keeply feedback: ${category}`,
      text: `Category: ${category}\n\nMessage:\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    return NextResponse.json(
      { error: "We couldn't send that feedback right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
