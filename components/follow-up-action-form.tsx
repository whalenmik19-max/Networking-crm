"use client";

import { FormEvent, useState } from "react";
import { useContacts } from "@/components/contacts-provider";
import { interactionTypes, type Contact } from "@/lib/types";

type FollowUpActionFormProps = {
  contact: Contact;
};

function getTodayString() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function FollowUpActionForm({ contact }: FollowUpActionFormProps) {
  const { addInteraction, updateContact } = useContacts();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    date: getTodayString(),
    type: "Email",
    notes: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSaving(true);

    const updatedWithInteraction = await addInteraction(contact.id, {
      date: formState.date,
      type: formState.type.trim(),
      notes: formState.notes.trim() || "Followed up.",
    });

    if (!updatedWithInteraction) {
      setIsSaving(false);
      setError("We couldn't mark this follow-up yet.");
      return;
    }

    const updatedContact = await updateContact(contact.id, {
      ...updatedWithInteraction,
      nextFollowUpDate: "",
    });

    setIsSaving(false);

    if (!updatedContact) {
      setError("We saved the interaction, but couldn't clear the follow-up date.");
      return;
    }

    setStatus("Marked as followed up.");
    setIsOpen(false);
    setFormState({
      date: getTodayString(),
      type: "Email",
      notes: "",
    });
  }

  return (
    <div className="follow-up-action-block">
      <button
        type="button"
        className="button button-secondary button-small"
        onClick={() => {
          setIsOpen((current) => !current);
          setError("");
          setStatus("");
        }}
      >
        Mark as followed up
      </button>

      {isOpen ? (
        <form className="follow-up-inline-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor={`followed-up-date-${contact.id}`}>Date</label>
              <input
                id={`followed-up-date-${contact.id}`}
                type="date"
                value={formState.date}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, date: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor={`followed-up-type-${contact.id}`}>Interaction type</label>
              <input
                id={`followed-up-type-${contact.id}`}
                list={`followed-up-types-${contact.id}`}
                value={formState.type}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, type: event.target.value }))
                }
                required
              />
              <datalist id={`followed-up-types-${contact.id}`}>
                {interactionTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div className="field field-full">
              <label htmlFor={`followed-up-notes-${contact.id}`}>Quick note</label>
              <textarea
                id={`followed-up-notes-${contact.id}`}
                value={formState.notes}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="What happened in the follow-up?"
              />
            </div>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          {status ? <p className="helper-text">{status}</p> : null}

          <div className="form-actions follow-up-inline-actions">
            <button type="submit" className="button button-primary button-small" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
