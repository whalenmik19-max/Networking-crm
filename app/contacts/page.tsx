"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { useContacts } from "@/components/contacts-provider";
import { formatDate } from "@/lib/contact-utils";

export default function ContactsPage() {
  const { contacts } = useContacts();

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Contacts</p>
          <h1>All relationships in one place</h1>
          <p className="section-copy">
            Browse your network, review notes, and jump into the next best follow-up.
          </p>
        </div>
        <Link className="button button-primary" href="/contacts/new">
          Add contact
        </Link>
      </section>

      {contacts.length === 0 ? (
        <EmptyState
          title="Your contact list is empty"
          description="Add your first networking contact to start building your personal CRM."
          actionLabel="Create contact"
          actionHref="/contacts/new"
        />
      ) : (
        <section className="table-panel">
          <div className="contacts-table">
            <div className="contacts-table-row contacts-table-head">
              <span>Name</span>
              <span>Company</span>
              <span>Where we met</span>
              <span>Next follow-up</span>
            </div>

            {contacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="contacts-table-row contacts-table-link"
              >
                <span>
                  <strong>{contact.name}</strong>
                  <small>{contact.role}</small>
                </span>
                <span>{contact.company}</span>
                <span>{contact.whereWeMet}</span>
                <span>{formatDate(contact.nextFollowUpDate)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
