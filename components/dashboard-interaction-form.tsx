"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useContacts } from "@/components/contacts-provider";
import { formatProfessionalSummary } from "@/lib/contact-utils";
import { interactionTypes } from "@/lib/types";

export function DashboardInteractionForm() {
  const { contacts, addInteraction } = useContacts();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    contactId: contacts[0]?.id ?? "",
    date: "",
    type: "",
    notes: "",
  });

  const selectableContacts = useMemo(
    () => contacts.slice().sort((first, second) => first.name.localeCompare(second.name)),
    [contacts],
  );

  useEffect(() => {
    if (!formState.contactId && selectableContacts[0]) {
      setFormState((current) => ({ ...current, contactId: selectableContacts[0].id }));
      return;
    }

    if (
      formState.contactId &&
      !selectableContacts.some((contact) => contact.id === formState.contactId)
    ) {
      setFormState((current) => ({
        ...current,
        contactId: selectableContacts[0]?.id ?? "",
      }));
    }
  }, [formState.contactId, selectableContacts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!formState.contactId) {
      setError("Choose a contact first.");
      return;
    }

    setIsSaving(true);
    const updatedContact = await addInteraction(formState.contactId, {
      date: formState.date,
      type: formState.type.trim(),
      notes: formState.notes.trim(),
    });
    setIsSaving(false);

    if (!updatedContact) {
      setError("We couldn't save this interaction right now.");
      return;
    }

    setStatus(`Saved for ${updatedContact.name}.`);
    setFormState((current) => ({
      ...current,
      date: "",
      type: "",
      notes: "",
    }));
  }

  if (contacts.length === 0) {
    return (
      <div className="content-panel dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Quick update</p>
            <h2>Log an interaction</h2>
          </div>
        </div>
        <p className="section-copy">
          Add your first contact, then you can quickly log a conversation from the dashboard.
        </p>
        <Link href="/contacts/new" className="button button-primary quick-log-empty-action">
          Add Contact
        </Link>
      </div>
    );
  }

  return (
    <form className="content-panel dashboard-panel quick-log-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Quick update</p>
          <h2>Log an interaction</h2>
        </div>
      </div>

      <div className="form-grid quick-log-grid">
        <div className="field">
          <label htmlFor="dashboard-contact">Contact</label>
          <select
            id="dashboard-contact"
            value={formState.contactId}
            onChange={(event) =>
              setFormState((current) => ({ ...current, contactId: event.target.value }))
            }
          >
            {selectableContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
                {formatProfessionalSummary(contact) !== "No company or role added yet"
                  ? ` — ${formatProfessionalSummary(contact)}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dashboard-date">Date</label>
          <input
            id="dashboard-date"
            type="date"
            required
            value={formState.date}
            onChange={(event) =>
              setFormState((current) => ({ ...current, date: event.target.value }))
            }
          />
        </div>

        <div className="field field-full">
          <label htmlFor="dashboard-type">Interaction type</label>
          <input
            id="dashboard-type"
            list="dashboard-interaction-types"
            required
            value={formState.type}
            onChange={(event) =>
              setFormState((current) => ({ ...current, type: event.target.value }))
            }
            placeholder="Coffee Chat, Recruiter Call, LinkedIn Message..."
          />
          <datalist id="dashboard-interaction-types">
            {interactionTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div className="field field-full">
          <label htmlFor="dashboard-notes">Notes</label>
          <textarea
            id="dashboard-notes"
            required
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            placeholder="Capture what happened and what to remember next."
          />
        </div>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {status ? <p className="helper-text">{status}</p> : null}

      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save interaction"}
        </button>
      </div>
    </form>
  );
}
