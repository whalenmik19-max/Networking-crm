"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setIsSending(true);
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("feedback_submissions").insert({
      category,
      message: trimmedMessage,
    });

    setIsSending(false);

    if (error) {
      console.error("Feedback submission failed:", error);
      setStatus(error.message || "We couldn't send your feedback right now.");
      return;
    }

    setMessage("");
    setCategory("general");
    setStatus("Thanks for the feedback. It was sent for admin review.");
  }

  return (
    <div className="page-stack">
      <section className="page-header feedback-header">
        <div className="page-header-content-block">
          <p className="eyebrow">Feedback</p>
          <h1 className="page-header-title-nowrap">Tell us what would make Keeply better</h1>
          <p className="section-copy feedback-header-copy">
            Share ideas, bugs, or small frustrations. Feedback is sent for admin review to
            help improve Keeply.
          </p>
        </div>
      </section>

      <section>
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="feedback-category">Feedback type</label>
            <select
              id="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="general">General feedback</option>
              <option value="bug">Bug report</option>
              <option value="feature">Feature idea</option>
              <option value="design">Design feedback</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="feedback-message">Your feedback</label>
            <textarea
              id="feedback-message"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What is working well? What feels confusing? What would you change?"
            />
          </div>

          {status ? <p className="feedback-success">{status}</p> : null}

          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={isSending}>
              {isSending ? "Sending..." : "Send feedback"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
