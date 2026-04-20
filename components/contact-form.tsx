"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useContacts } from "@/components/contacts-provider";

export function ContactForm() {
  const router = useRouter();
  const { addContact } = useContacts();
  const [formState, setFormState] = useState({
    name: "",
    company: "",
    role: "",
    whereWeMet: "",
    notes: "",
    nextFollowUpDate: "",
    tags: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const contact = addContact({
      name: formState.name.trim(),
      company: formState.company.trim(),
      role: formState.role.trim(),
      whereWeMet: formState.whereWeMet.trim(),
      notes: formState.notes.trim(),
      nextFollowUpDate: formState.nextFollowUpDate,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    router.push(`/contacts/${contact.id}`);
  }

  function updateField(name: keyof typeof formState, value: string) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Taylor Kim"
          />
        </div>

        <div className="field">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            required
            value={formState.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Acme Labs"
          />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            required
            value={formState.role}
            onChange={(event) => updateField("role", event.target.value)}
            placeholder="Software Engineer"
          />
        </div>

        <div className="field">
          <label htmlFor="whereWeMet">Where we met</label>
          <input
            id="whereWeMet"
            required
            value={formState.whereWeMet}
            onChange={(event) => updateField("whereWeMet", event.target.value)}
            placeholder="Campus career fair"
          />
        </div>

        <div className="field">
          <label htmlFor="nextFollowUpDate">Next follow-up date</label>
          <input
            id="nextFollowUpDate"
            type="date"
            required
            value={formState.nextFollowUpDate}
            onChange={(event) => updateField("nextFollowUpDate", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            value={formState.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="mentor, product, internship"
          />
          <p className="helper-text">Separate tags with commas.</p>
        </div>

        <div className="field field-full">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            required
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Talked about product design internships and their advice for sophomore year recruiting."
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="button button-primary">
          Save contact
        </button>
      </div>
    </form>
  );
}
