"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ProLockCard } from "@/components/pro-lock-card";
import { useAuth } from "@/components/auth-provider";
import { useContacts } from "@/components/contacts-provider";
import { InteractionForm } from "@/components/interaction-form";
import { ReminderCard } from "@/components/reminder-card";
import {
  getConversationPrep,
  formatDate,
  formatOptionalDate,
  formatProfessionalSummary,
  getPreviewText,
} from "@/lib/contact-utils";
import { isSampleContact } from "@/lib/sample-contacts";
import { isProPlan } from "@/lib/plans";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, isGuestMode } = useAuth();
  const { contacts, deleteContact, isContactsLoading, contactsError } = useContacts();
  const contact = contacts.find((item) => item.id === params.id);

  if (isContactsLoading) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Contact detail</p>
          <h1>Loading contact...</h1>
          <p className="section-copy">We&apos;re pulling the latest details from Keeply.</p>
        </div>
      </div>
    );
  }

  if (!contact && contactsError) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Contact detail</p>
          <h1>We couldn&apos;t load this contact.</h1>
          <p className="section-copy">{contactsError}</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    notFound();
  }

  const activeContact = contact;
  const conversationPrep = getConversationPrep(activeContact);
  const isPro = isProPlan(currentUser?.plan);
  const isGuestPreviewContact = isGuestMode && !isSampleContact(activeContact.id);

  async function handleDeleteContact() {
    const confirmed = window.confirm(
      `Delete ${activeContact.name} from Keeply? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    await deleteContact(activeContact.id);
    router.push("/contacts");
  }

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div>
          <Link href="/contacts" className="text-link">
            Back to contacts
          </Link>
          <p className="eyebrow">Contact detail</p>
          <h1>{activeContact.name}</h1>
          <p className="hero-copy">{formatProfessionalSummary(activeContact)}</p>
        </div>
        <span className="date-chip">
          Next follow-up: {formatOptionalDate(activeContact.nextFollowUpDate)}
        </span>
      </section>

      <section className="content-panel detail-actions">
        <div>
          <p className="eyebrow">Manage contact</p>
          <h2>Keep this relationship current</h2>
        </div>
        <div className="detail-action-buttons">
          <Link href={`/contacts/${activeContact.id}/edit`} className="button button-primary">
            Edit contact
          </Link>
          <button
            type="button"
            className="button danger-button"
            onClick={handleDeleteContact}
          >
            Delete contact
          </button>
        </div>
      </section>

      <section className="detail-grid">
        <article className="content-panel">
          <h2>Relationship snapshot</h2>
          <dl className="detail-list">
            <div>
              <dt>Company</dt>
              <dd>{activeContact.company || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{activeContact.role || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Where we met</dt>
              <dd>{activeContact.whereWeMet || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Next follow-up date</dt>
              <dd>{formatOptionalDate(activeContact.nextFollowUpDate)}</dd>
            </div>
          </dl>
        </article>

        <article className="content-panel">
          <h2>Notes</h2>
          <p className="notes-copy">{activeContact.notes}</p>
          <div className="tag-row">
            {activeContact.tags.map((tag) => (
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
            <p className="eyebrow">Signature feature</p>
            <h2>What to say next</h2>
          </div>
        </div>

        {isPro ? (
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
                <p className="prep-label prep-emphasis-label">What to say next</p>
                <p className="prompt-copy">You could say:</p>
                <p className="notes-copy">{conversationPrep.suggestedMessage}</p>
              </div>
            </article>
          </div>
        ) : isGuestPreviewContact ? (
          <div className="prep-grid">
            <article className="prep-card">
              <p className="prep-label">Most recent interaction</p>
              <p className="notes-copy">
                {getPreviewText(conversationPrep.recentInteractionSummary, 14)}
              </p>
            </article>

            <article className="prep-card">
              <p className="prep-label">Topic preview</p>
              <ul className="prep-list">
                <li>{conversationPrep.keyTopics[0] || "Your notes will show up here"}</li>
              </ul>
            </article>

            <article className="prep-card prep-card-wide">
              <div className="suggested-follow-up-card preview-follow-up-card">
                <p className="prep-label prep-emphasis-label">Preview: What to say next</p>
                <p className="prompt-copy">You could say:</p>
                <p className="notes-copy">
                  {getPreviewText(conversationPrep.suggestedMessage, 18)}
                </p>
                <p className="helper-text">
                  Create an account and upgrade to Pro to unlock the full prep workflow.
                </p>
              </div>
            </article>
          </div>
        ) : (
          <ProLockCard
            title={
              isGuestMode
                ? "Add one of your 3 demo contacts to preview what to say next"
                : "Unlock smarter follow-ups with Pro"
            }
            description={
              isGuestMode
                ? "Guests get a limited preview on the first 3 contacts they add. Full prep insights stay on Pro."
                : "Use Pro to get suggested follow-ups, key topics, and prep notes before you reach back out."
            }
          />
        )}
      </section>

      <section className="detail-grid detail-grid-wide">
        <article className="content-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Interaction history</p>
              <h2>Every touchpoint with {activeContact.name}</h2>
            </div>
          </div>

          {activeContact.interactions.length === 0 ? (
            <p className="section-copy">
              No interactions logged yet. Add the next coffee chat, class conversation,
              or follow-up email below.
            </p>
          ) : (
            <div className="timeline">
              {activeContact.interactions.map((interaction) => (
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
          <ReminderCard contactId={activeContact.id} contactName={activeContact.name} />
          <InteractionForm contactId={activeContact.id} />
        </div>
      </section>
    </div>
  );
}
