"use client";

import { useEffect, useRef, useState } from "react";
import { useContacts } from "@/components/contacts-provider";
import { formatOptionalDateTime } from "@/lib/contact-utils";

type ReminderCardProps = {
  contactId: string;
  contactName: string;
};

export function ReminderCard({ contactId, contactName }: ReminderCardProps) {
  const { contacts, updateReminder } = useContacts();
  const contact = contacts.find((item) => item.id === contactId);
  const [scheduledFor, setScheduledFor] = useState(contact?.reminderAt ?? "");
  const [status, setStatus] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setScheduledFor(contact?.reminderAt ?? "");
  }, [contact?.reminderAt]);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!contact?.reminderAt || typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const reminderTime = new Date(contact.reminderAt).getTime();
    const delay = reminderTime - Date.now();

    const sendNotification = () => {
      new Notification(`Reach out to ${contactName}`, {
        body: `Time to follow up with ${contactName}.`,
      });
      updateReminder(contactId, "");
      setStatus(`Reminder sent for ${contactName}.`);
    };

    if (delay <= 0) {
      sendNotification();
      return;
    }

    timeoutRef.current = window.setTimeout(sendNotification, delay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [contact?.reminderAt, contactId, contactName, updateReminder]);

  async function handleSetReminder() {
    if (!scheduledFor) {
      setStatus("Choose a date and time first.");
      return;
    }

    if (new Date(scheduledFor).getTime() <= Date.now()) {
      setStatus("Pick a time in the future.");
      return;
    }

    if (!("Notification" in window)) {
      setStatus("This browser does not support notifications.");
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      setStatus("Notifications are blocked. Allow them in your browser and try again.");
      return;
    }

    updateReminder(contactId, scheduledFor);
    setStatus(`Reminder set for ${formatOptionalDateTime(scheduledFor)}.`);
  }

  function handleClearReminder() {
    updateReminder(contactId, "");
    setScheduledFor("");
    setStatus("Reminder cleared.");
  }

  return (
    <article className="content-panel reminder-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Reminder</p>
          <h2>Schedule a notification</h2>
        </div>
      </div>

      <p className="section-copy">
        Set a time to reach out and this browser will notify you when the reminder comes due.
      </p>

      <div className="field">
        <label htmlFor="reminderAt">Reminder time</label>
        <input
          id="reminderAt"
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
        />
        <p className="helper-text">
          Current reminder: {formatOptionalDateTime(contact?.reminderAt ?? "")}
        </p>
      </div>

      <div className="reminder-actions">
        <button type="button" className="button button-primary" onClick={handleSetReminder}>
          Set notification
        </button>
        <button type="button" className="button button-secondary" onClick={handleClearReminder}>
          Clear
        </button>
      </div>

      {status ? <p className="helper-text">{status}</p> : null}
    </article>
  );
}
