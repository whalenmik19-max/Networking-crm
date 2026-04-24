"use client";

import { FormEvent, useEffect, useState } from "react";
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
  getRelationshipStrengthLabel,
  getPreviewText,
} from "@/lib/contact-utils";
import { isSampleContact } from "@/lib/sample-contacts";
import { isProPlan } from "@/lib/plans";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, isGuestMode, isLoading } = useAuth();
  const { contacts, deleteContact, updateContact, isContactsLoading, contactsError } =
    useContacts();
  const contact = contacts.find((item) => item.id === params.id);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState("");
  const [followUpError, setFollowUpError] = useState("");
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [notesStatus, setNotesStatus] = useState("");
  const [notesError, setNotesError] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setFollowUpDate(contact?.nextFollowUpDate ?? "");
  }, [contact?.nextFollowUpDate]);

  useEffect(() => {
    setNotesValue(contact?.notes ?? "");
  }, [contact?.notes]);

  if (isLoading || (currentUser && isContactsLoading)) {
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

  async function handleFollowUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFollowUpStatus("");
    setFollowUpError("");
    setIsSavingFollowUp(true);

    const updatedContact = await updateContact(activeContact.id, {
      ...activeContact,
      nextFollowUpDate: followUpDate,
    });

    setIsSavingFollowUp(false);

    if (!updatedContact) {
      setFollowUpError("We couldn't save the next follow-up date.");
      return;
    }

    setFollowUpStatus(followUpDate ? "Next follow-up saved." : "Next follow-up cleared.");
  }

  async function handleNotesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotesStatus("");
    setNotesError("");
    setIsSavingNotes(true);

    const updatedContact = await updateContact(activeContact.id, {
      ...activeContact,
      notes: notesValue.trim(),
    });

    setIsSavingNotes(false);

    if (!updatedContact) {
      setNotesError("We couldn't save your notes right now.");
      return;
    }

    setNotesStatus("Notes saved.");
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
            <div>
              <dt>Priority</dt>
              <dd>
                <span className="priority-badge">{getRelationshipStrengthLabel(activeContact)}</span>
              </dd>
            </div>
          </dl>

          <form className="inline-follow-up-form" onSubmit={handleFollowUpSubmit}>
            <div className="field">
              <label htmlFor="detail-follow-up-date">Schedule next follow-up</label>
              <input
                id="detail-follow-up-date"
                type="date"
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.target.value)}
              />
            </div>
            {followUpError ? <p className="auth-error">{followUpError}</p> : null}
            {followUpStatus ? <p className="helper-text">{followUpStatus}</p> : null}
            <div className="form-actions inline-follow-up-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={isSavingFollowUp}
              >
                {isSavingFollowUp ? "Saving..." : "Save next follow-up"}
              </button>
              <button
                type="button"
                className="button button-secondary"
                disabled={isSavingFollowUp || !followUpDate}
                onClick={() => setFollowUpDate("")}
              >
                Clear
              </button>
            </div>
          </form>
        </article>

        <article className="content-panel notes-panel">
          <h2>Notes</h2>
          <form className="inline-notes-form" onSubmit={handleNotesSubmit}>
            <div className="field">
              <label htmlFor="contact-notes">Your notes</label>
              <textarea
                id="contact-notes"
                value={notesValue}
                onChange={(event) => setNotesValue(event.target.value)}
                placeholder="Capture context, details, and anything you want Keeply to remember."
              />
            </div>
            {notesError ? <p className="auth-error">{notesError}</p> : null}
            {notesStatus ? <p className="helper-text">{notesStatus}</p> : null}
            <div className="form-actions inline-follow-up-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={isSavingNotes}
              >
                {isSavingNotes ? "Saving..." : "Save notes"}
              </button>
            </div>
          </form>
          <div className="tag-row">
            {activeContact.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="detail-grid detail-grid-wide">
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

              <article className="prep-card prep-card-wide">
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

        <div className="stack-panel">
          <ReminderCard contactId={activeContact.id} contactName={activeContact.name} />
          <InteractionForm contactId={activeContact.id} />
        </div>
      </section>

      <section className="content-panel">
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
      </section>
    </div>
  );
}
