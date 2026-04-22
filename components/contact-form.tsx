"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useContacts } from "@/components/contacts-provider";
import type { Contact, NewContact, RelationshipType } from "@/lib/types";

type ContactFormProps = {
  mode?: "create" | "edit";
  initialContact?: Contact;
};

type ContactFormState = {
  name: string;
  company: string;
  role: string;
  email: string;
  phoneNumber: string;
  school: string;
  dateMet: string;
  whereWeMet: string;
  relationshipType: RelationshipType;
  notes: string;
  nextFollowUpDate: string;
  tags: string;
};

function buildFormState(contact?: Contact): ContactFormState {
  return {
    name: contact?.name ?? "",
    company: contact?.company ?? "",
    role: contact?.role ?? "",
    email: contact?.email ?? "",
    phoneNumber: contact?.phoneNumber ?? "",
    school: contact?.school ?? "",
    dateMet: contact?.dateMet ?? "",
    whereWeMet: contact?.whereWeMet ?? "",
    relationshipType: contact?.relationshipType ?? "",
    notes: contact?.notes ?? "",
    nextFollowUpDate: contact?.nextFollowUpDate ?? "",
    tags: contact?.tags.join(", ") ?? "",
  };
}

export function ContactForm({
  mode = "create",
  initialContact,
}: ContactFormProps) {
  const router = useRouter();
  const { addContact, updateContact, canAddContact, guestContactsRemaining, isGuestMode } =
    useContacts();
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState<ContactFormState>(() =>
    buildFormState(initialContact),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const contactData: NewContact = {
      name: formState.name.trim(),
      company: formState.company.trim(),
      role: formState.role.trim(),
      email: formState.email.trim(),
      phoneNumber: formState.phoneNumber.trim(),
      school: formState.school.trim(),
      dateMet: formState.dateMet,
      whereWeMet: formState.whereWeMet.trim(),
      relationshipType: formState.relationshipType.trim(),
      notes: formState.notes.trim(),
      nextFollowUpDate: formState.nextFollowUpDate,
      reminderAt: "",
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      interactions: initialContact?.interactions ?? [],
    };

    if (mode === "edit" && initialContact) {
      const updatedContact = updateContact(initialContact.id, contactData);

      if (updatedContact) {
        router.push(`/contacts/${updatedContact.id}`);
      }

      return;
    }

    const contact = addContact(contactData);

    if (!contact) {
      setFormError(
        "Demo mode lets you add up to 3 of your own contacts. Sign up to save more.",
      );
      return;
    }

    router.push(`/contacts/${contact.id}`);
  }

  function updateField<Name extends keyof typeof formState>(
    name: Name,
    value: (typeof formState)[Name],
  ) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      {mode === "create" && isGuestMode ? (
        <div className="trial-banner">
          <p className="eyebrow">Try the product</p>
          <p className="section-copy">
            You can add up to {guestContactsRemaining} more contact
            {guestContactsRemaining === 1 ? "" : "s"} in demo mode before signing up.
          </p>
        </div>
      ) : null}

      <p className="helper-text form-note">
        You can start with just a name-add more later.
      </p>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name *</label>
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
            value={formState.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Acme Labs"
          />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            value={formState.role}
            onChange={(event) => updateField("role", event.target.value)}
            placeholder="Software Engineer"
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div className="field">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={formState.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            placeholder="(555) 555-5555"
          />
        </div>

        <div className="field">
          <label htmlFor="school">School</label>
          <input
            id="school"
            value={formState.school}
            onChange={(event) => updateField("school", event.target.value)}
            placeholder="University of Michigan"
          />
        </div>

        <div className="field">
          <label htmlFor="dateMet">Date Met *</label>
          <input
            id="dateMet"
            type="date"
            value={formState.dateMet}
            onChange={(event) => updateField("dateMet", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="whereWeMet">Where we met *</label>
          <input
            id="whereWeMet"
            value={formState.whereWeMet}
            onChange={(event) => updateField("whereWeMet", event.target.value)}
            placeholder="Campus career fair"
          />
        </div>

        <div className="field">
          <label htmlFor="relationshipType">Relationship type</label>
          <input
            id="relationshipType"
            value={formState.relationshipType}
            onChange={(event) => updateField("relationshipType", event.target.value)}
            placeholder="Mentor, recruiter, friend, alumni contact..."
          />
          <p className="helper-text">Type any label that fits this relationship.</p>
        </div>

        <div className="field">
          <label htmlFor="nextFollowUpDate">Next follow-up date</label>
          <input
            id="nextFollowUpDate"
            type="date"
            value={formState.nextFollowUpDate}
            onChange={(event) => updateField("nextFollowUpDate", event.target.value)}
          />
          <p className="helper-text">Leave this blank if you do not want to schedule one yet.</p>
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
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Talked about product design internships and their advice for sophomore year recruiting."
          />
        </div>
      </div>

      {formError ? <p className="auth-error">{formError}</p> : null}

      <div className="form-actions">
        <button type="submit" className="button button-primary">
          {mode === "edit" ? "Update contact" : "Save contact"}
        </button>
      </div>
    </form>
  );
}
