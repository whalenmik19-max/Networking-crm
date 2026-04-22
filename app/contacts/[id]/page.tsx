"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useContacts } from "@/components/contacts-provider";
import { InteractionForm } from "@/components/interaction-form";
import { ReminderCard } from "@/components/reminder-card";
import {
  getConversationPrep,
  formatDate,
  formatOptionalDate,
  formatOptionalDateTime,
  formatProfessionalSummary,
} from "@/lib/contact-utils";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const { contacts } = useContacts();
  const contact = contacts.find((item) => item.id === params.id);

  if (!contact) {
    notFound();
  }

  const conversationPrep = getConversationPrep(contact);

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <Link href="/contacts" className="text-link">
            Back to contacts
          </Link>
          <p className="eyebrow">Contact detail</p>
          <h1>{contact.name}</h1>
          <p className="hero-copy">{formatProfessionalSummary(contact)}</p>
        </div>
        <span className="date-chip">
          Next follow-up: {formatOptionalDate(contact.nextFollowUpDate)}
        </span>
      </section>

      <section className="content-panel detail-actions">
        <div>
          <p className="eyebrow">Manage contact</p>
          <h2>Keep this relationship current</h2>
        </div>
        <Link href={`/contacts/${contact.id}/edit`} className="button button-primary">
          Edit contact
        </Link>
      </section>

      <section className="detail-grid">
        <article className="content-panel">
          <h2>Relationship snapshot</h2>
          <dl className="detail-list">
            <div>
              <dt>Company</dt>
              <dd>{contact.company || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{contact.role || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{contact.email || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Phone Number</dt>
              <dd>{contact.phoneNumber || "Not added yet"}</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>{contact.school || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Date met</dt>
              <dd>{contact.dateMet ? formatDate(contact.dateMet) : "Not added yet"}</dd>
            </div>
            <div>
              <dt>Where we met</dt>
              <dd>{contact.whereWeMet}</dd>
            </div>
            <div>
              <dt>Relationship type</dt>
              <dd>{contact.relationshipType || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Next follow-up date</dt>
              <dd>{formatOptionalDate(contact.nextFollowUpDate)}</dd>
            </div>
            <div>
              <dt>Reminder notification</dt>
              <dd>{formatOptionalDateTime(contact.reminderAt)}</dd>
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

      <section className="content-panel prep-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Conversation prep</p>
            <h2>Quick reconnect notes</h2>
          </div>
        </div>

        <div className="prep-grid">
          <article className="prep-card">
            <p className="prep-label">Most recent interaction</p>
            <p className="notes-copy">{conversationPrep.recentInteractionSummary}</p>
          </article>

          <article className="prep-card">
            <p className="prep-label">Key topics discussed</p>
            <ul className="prep-list">
              {conversationPrep.keyTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </article>

          <article className="prep-card">
            <p className="prep-label">Suggested talking points</p>
            <ul className="prep-list">
              {conversationPrep.followUpTalkingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="prep-card prep-card-wide">
            <div className="suggested-follow-up-card">
              <p className="prep-label">💬 Suggested follow-up</p>
              <p className="notes-copy">{conversationPrep.suggestedMessage}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="detail-grid detail-grid-wide">
        <article className="content-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Interaction history</p>
              <h2>Every touchpoint with {contact.name}</h2>
            </div>
          </div>

          {contact.interactions.length === 0 ? (
            <p className="section-copy">
              No interactions logged yet. Add the next coffee chat, class conversation,
              or follow-up email below.
            </p>
          ) : (
            <div className="timeline">
              {contact.interactions.map((interaction) => (
                <article key={interaction.id} className="timeline-card">
                  <div className="timeline-marker" aria-hidden="true" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="date-chip">{formatDate(interaction.date)}</span>
                      <span className="tag interaction-type">{interaction.type}</span>
                    </div>
                    <p className="notes-copy">{interaction.notes}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <div className="stack-panel">
          <ReminderCard contactId={contact.id} contactName={contact.name} />
          <InteractionForm contactId={contact.id} />
        </div>
      </section>
    </div>
  );
}
