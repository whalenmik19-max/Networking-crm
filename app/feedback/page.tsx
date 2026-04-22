"use client";

import { FormEvent, useEffect, useState } from "react";

type FeedbackEntry = {
  id: string;
  message: string;
  category: string;
  createdAt: string;
};

const feedbackStorageKey = "keeply-feedback";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);

  useEffect(() => {
    const storedEntries = window.localStorage.getItem(feedbackStorageKey);

    if (storedEntries) {
      setEntries(JSON.parse(storedEntries) as FeedbackEntry[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(feedbackStorageKey, JSON.stringify(entries));
  }, [entries]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newEntry: FeedbackEntry = {
      id: crypto.randomUUID(),
      message: message.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [newEntry, ...current]);
    setMessage("");
    setCategory("general");
    setStatus("Thanks for the feedback. It was saved on this device.");
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Feedback</p>
          <h1>Tell us what would make Keeply better</h1>
          <p className="section-copy">
            Share ideas, bugs, or small frustrations. This feedback page keeps things simple
            and stores submissions on this browser.
          </p>
        </div>
      </section>

      <section className="detail-grid detail-grid-wide">
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
            <button type="submit" className="button button-primary">
              Send feedback
            </button>
          </div>
        </form>

        <section className="content-panel feedback-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Saved on this browser</p>
              <h2>Recent feedback</h2>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="section-copy">
              No feedback saved yet. Submit your first idea or bug report here.
            </p>
          ) : (
            <div className="action-list">
              {entries.map((entry) => (
                <article key={entry.id} className="action-card">
                  <div className="action-card-top">
                    <p className="prep-label">{entry.category}</p>
                    <span className="status-pill status-neutral">
                      {new Date(entry.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <p className="notes-copy">{entry.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
