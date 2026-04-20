"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useContacts } from "@/components/contacts-provider";
import { formatDate } from "@/lib/contact-utils";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const { contacts } = useContacts();
  const contact = contacts.find((item) => item.id === params.id);

  if (!contact) {
    notFound();
  }

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <Link href="/contacts" className="text-link">
            Back to contacts
          </Link>
          <p className="eyebrow">Contact detail</p>
          <h1>{contact.name}</h1>
          <p className="hero-copy">
            {contact.role} at {contact.company}
          </p>
        </div>
        <span className="date-chip">Next follow-up: {formatDate(contact.nextFollowUpDate)}</span>
      </section>

      <section className="detail-grid">
        <article className="content-panel">
          <h2>Relationship snapshot</h2>
          <dl className="detail-list">
            <div>
              <dt>Company</dt>
              <dd>{contact.company}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{contact.role}</dd>
            </div>
            <div>
              <dt>Where we met</dt>
              <dd>{contact.whereWeMet}</dd>
            </div>
            <div>
              <dt>Next follow-up date</dt>
              <dd>{formatDate(contact.nextFollowUpDate)}</dd>
            </div>
          </dl>
        </article>

        <article className="content-panel">
          <h2>Notes</h2>
          <p className="notes-copy">{contact.notes}</p>
          <div className="tag-row">
            {contact.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
