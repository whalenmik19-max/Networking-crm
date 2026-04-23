"use client";

import { FormEvent, useState } from "react";
import { useContacts } from "@/components/contacts-provider";
import { interactionTypes } from "@/lib/types";

type InteractionFormProps = {
  contactId: string;
};

export function InteractionForm({ contactId }: InteractionFormProps) {
  const { addInteraction } = useContacts();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({
    date: "",
    type: "",
    notes: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);

    const updatedContact = await addInteraction(contactId, {
      date: formState.date,
      type: formState.type.trim(),
      notes: formState.notes.trim(),
    });

    if (!updatedContact) {
      setFormError("We couldn't save this interaction right now.");
      setIsSaving(false);
      return;
    }

    setFormState({
      date: "",
      type: "",
      notes: "",
    });
    setIsSaving(false);
  }

  return (
    <form className="form-panel compact-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">New interaction</p>
          <h2>Log a conversation or touchpoint</h2>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="interaction-date">Date</label>
          <input
            id="interaction-date"
            type="date"
            required
            value={formState.date}
            onChange={(event) =>
              setFormState((current) => ({ ...current, date: event.target.value }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="interaction-type">Type of meeting</label>
          <input
            id="interaction-type"
            list="interaction-types"
            required
            value={formState.type}
            onChange={(event) =>
              setFormState((current) => ({ ...current, type: event.target.value }))
            }
            placeholder="Coffee chat, recruiter call, intro meeting..."
          />
          <datalist id="interaction-types">
            {interactionTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div className="field field-full">
          <label htmlFor="interaction-notes">Notes</label>
          <textarea
            id="interaction-notes"
            required
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            placeholder="Summarize what happened, what you learned, and any next step you want to remember."
          />
        </div>
      </div>

      {formError ? <p className="auth-error">{formError}</p> : null}

      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save interaction"}
        </button>
      </div>
    </form>
  );
}
