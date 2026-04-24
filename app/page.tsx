"use client";

import Link from "next/link";
import { DashboardInteractionForm } from "@/components/dashboard-interaction-form";
import { FollowUpActionForm } from "@/components/follow-up-action-form";
import { ProLockCard } from "@/components/pro-lock-card";
import { UpgradeButton } from "@/components/upgrade-button";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { useAuth } from "@/components/auth-provider";
import { useContacts } from "@/components/contacts-provider";
import {
  getConversationPrep,
  formatDate,
  formatOptionalDate,
  formatProfessionalSummary,
  getRelationshipStrengthLabel,
  getDaysSinceLastContact,
  getFollowUpsDueThisWeek,
  getInactiveContacts,
  getLastContactDate,
  getOverdueFollowUps,
  getPreviewText,
  getRecentlyAddedContacts,
} from "@/lib/contact-utils";
import { isSampleContact } from "@/lib/sample-contacts";
import { isProPlan } from "@/lib/plans";

export default function DashboardPage() {
  const { currentUser, isGuestMode } = useAuth();
  const { contacts, guestContactsRemaining, isContactsLoading, contactsError } = useContacts();
  const isPro = isProPlan(currentUser?.plan);
  const isFree = Boolean(currentUser) && !isPro;
  const overdueFollowUps = getOverdueFollowUps(contacts);
  const dueThisWeek = getFollowUpsDueThisWeek(contacts);
  const inactiveContacts = getInactiveContacts(contacts);
  const recentlyAddedContacts = getRecentlyAddedContacts(contacts);
  const guestPreviewContacts = isGuestMode
    ? contacts.filter((contact) => !isSampleContact(contact.id)).slice(0, 3)
    : [];
  const prepContacts = [...overdueFollowUps, ...dueThisWeek]
    .filter((contact, index, allContacts) =>
      allContacts.findIndex((item) => item.id === contact.id) === index,
    )
    .slice(0, 4);

  return (
    <div className="page-stack">
      <section className={`hero ${!currentUser ? "hero-guest" : ""}`}>
        <div className="hero-content-block">
          <p className="eyebrow">Dashboard</p>
          <h1>Never forget who to follow up with</h1>
          <p className="hero-copy hero-copy-smart-wrap">
            Keep notes for your future self so every conversation picks up right where
            you left off.
          </p>
        </div>
        <div
          className={`hero-actions hero-actions-centered ${
            currentUser ? "hero-actions-signed-in" : ""
          }`}
        >
          {currentUser ? (
            <Link className="button button-primary" href="/contacts">
              View all contacts
            </Link>
          ) : (
            <Link className="button button-primary" href="/contacts/new">
              Add your first contact
            </Link>
          )}
          {!isPro && currentUser ? <UpgradeButton /> : null}
          {!currentUser ? (
            <Link className="button button-secondary" href="/signup">
              Create an account
            </Link>
          ) : null}
        </div>
      </section>

      {isGuestMode && guestContactsRemaining === 0 ? (
        <section className="trial-banner demo-limit-banner">
          <div>
            <p className="eyebrow">Demo limit reached</p>
            <p className="section-copy">
              You&apos;ve used all 3 demo contacts. Create an account to keep adding more,
              or view Pro to see the full Keeply workflow.
            </p>
          </div>
          <div className="hero-actions">
            <Link href="/signup" className="button button-primary">
              Create an account
            </Link>
            <UpgradeButton className="button button-secondary" />
          </div>
        </section>
      ) : null}

      {contactsError ? (
        <section className="content-panel">
          <p className="auth-error">{contactsError}</p>
        </section>
      ) : null}

      {isContactsLoading ? (
        <section className="content-panel">
          <p className="eyebrow">Dashboard</p>
          <h2>Loading your workspace...</h2>
          <p className="section-copy">
            We&apos;re pulling in your private contacts and follow-ups now.
          </p>
        </section>
      ) : null}

      {!isContactsLoading ? (
      <section className="content-panel priority-panel">
        {isPro ? (
          <>
            <p className="eyebrow">Today&apos;s priority</p>
            <h2>
              {overdueFollowUps.length > 0
                ? `You should reach out to ${overdueFollowUps.length} ${
                    overdueFollowUps.length === 1 ? "person" : "people"
                  } today.`
                : "You&apos;re caught up for today."}
            </h2>
            <p className="section-copy priority-panel-copy">
              {overdueFollowUps.length > 0
                ? "Start with your overdue follow-ups first, then move into what is due this week."
                : "Nothing is overdue right now, so you can focus on this week’s follow-ups and conversation prep."}
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Today&apos;s priority</p>
            <h2>Let Keeply point you to the right follow-up first.</h2>
            <p className="section-copy">
              {isGuestMode
                ? "Demo mode includes manual follow-up dates. Pro adds smart reminders and richer conversation prep once you create an account."
                : "Free keeps your contacts and manual follow-up dates organized. Pro adds smart reminders and richer conversation prep."}
            </p>
            {isGuestMode ? (
              <div className="hero-actions">
                <Link href="/signup" className="button button-primary">
                  Create an account
                </Link>
                <UpgradeButton className="button button-secondary" />
              </div>
            ) : (
              <UpgradeButton />
            )}
          </>
        )}
      </section>
      ) : null}

      {!isContactsLoading ? (
      <section className="stats-grid">
        <SectionCard title="Total contacts" value={String(contacts.length)} />
        <SectionCard title="Overdue" value={String(overdueFollowUps.length)} />
        <SectionCard title="Due this week" value={String(dueThisWeek.length)} />
      </section>
      ) : null}

      {!isContactsLoading ? (
      <section className="dashboard-grid">
        <DashboardInteractionForm />

        <article className="content-panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Action now</p>
              <h2>Overdue follow-ups</h2>
            </div>
            <span className="status-pill status-danger">{overdueFollowUps.length}</span>
          </div>

          {overdueFollowUps.length === 0 ? (
            <p className="section-copy">Nothing is overdue right now.</p>
          ) : (
            <div className="action-list">
              {overdueFollowUps.map((contact) => (
                <article key={contact.id} className="action-card action-card-with-form">
                  <Link href={`/contacts/${contact.id}`} className="action-card-link">
                    <div className="action-card-top">
                      <div>
                        <h3>{contact.name}</h3>
                        <p>{formatProfessionalSummary(contact)}</p>
                      </div>
                      <span className="status-pill status-danger">Overdue</span>
                    </div>
                    <p className="list-card-meta">
                      Follow-up date: {formatOptionalDate(contact.nextFollowUpDate)}
                    </p>
                    <p className="list-card-meta relationship-strength-label">
                      {getRelationshipStrengthLabel(contact)}
                    </p>
                  </Link>
                  <FollowUpActionForm contact={contact} />
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="content-panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">This week</p>
              <h2>Follow-ups due this week</h2>
            </div>
            <span className="status-pill status-warning">{dueThisWeek.length}</span>
          </div>

          {dueThisWeek.length === 0 ? (
            <p className="section-copy">No follow-ups are due this week.</p>
          ) : (
            <div className="action-list">
              {dueThisWeek.map((contact) => (
                <article key={contact.id} className="action-card action-card-with-form">
                  <Link href={`/contacts/${contact.id}`} className="action-card-link">
                    <div className="action-card-top">
                      <div>
                        <h3>{contact.name}</h3>
                        <p>{formatProfessionalSummary(contact)}</p>
                      </div>
                      <span className="status-pill status-warning">
                        {formatDate(contact.nextFollowUpDate)}
                      </span>
                    </div>
                    <p className="list-card-meta">{contact.relationshipType || "Relationship"} </p>
                    <p className="list-card-meta relationship-strength-label">
                      {getRelationshipStrengthLabel(contact)}
                    </p>
                  </Link>
                  <FollowUpActionForm contact={contact} />
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="content-panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Needs attention</p>
              <h2>No contact in 60+ days</h2>
            </div>
            <span className="status-pill status-neutral">{inactiveContacts.length}</span>
          </div>

          {inactiveContacts.length === 0 ? (
            <p className="section-copy">Everyone has been contacted within the last 60 days.</p>
          ) : (
            <div className="action-list">
              {inactiveContacts.map((contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="action-card">
                  <div className="action-card-top">
                    <div>
                      <h3>{contact.name}</h3>
                      <p>{formatProfessionalSummary(contact)}</p>
                    </div>
                    <span className="status-pill status-neutral">Reconnect</span>
                  </div>
                  <p className="list-card-meta">
                    Last contact: {formatDate(getLastContactDate(contact))}
                  </p>
                  {isPro ? (
                    <div className="suggested-follow-up-card">
                      <p className="prep-label prep-emphasis-label">What to say next</p>
                      <p className="notes-copy prompt-copy">
                        You could say:
                      </p>
                      <p className="notes-copy">
                        {getConversationPrep(contact).suggestedMessage}
                      </p>
                      <p className="helper-text">
                        You haven&apos;t talked to {contact.name} in{" "}
                        {getDaysSinceLastContact(contact) ?? 60} days
                      </p>
                    </div>
                  ) : isGuestMode && !isSampleContact(contact.id) ? (
                    <div className="suggested-follow-up-card preview-follow-up-card">
                      <p className="prep-label prep-emphasis-label">Preview: What to say next</p>
                      <p className="notes-copy">
                        {getPreviewText(getConversationPrep(contact).suggestedMessage, 18)}
                      </p>
                      <p className="helper-text">
                        Create an account and upgrade to Pro for the full version.
                      </p>
                    </div>
                  ) : (
                    <div className="suggested-follow-up-card locked-follow-up-card">
                      <p className="prep-label">
                        {isFree
                          ? "Unlock smarter follow-ups with Pro"
                          : "Add your own demo contacts to preview what to say next"}
                      </p>
                      <p className="notes-copy blurred-copy">
                        {isFree
                          ? "Personalized reconnect messages are available on Pro."
                          : "Guest mode gives you a limited preview on the first 3 contacts you add."}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </article>

      </section>
      ) : null}

      {!isContactsLoading ? (
      <section className="dashboard-grid">
        <article className="content-panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Signature feature</p>
              <h2>What to say next</h2>
            </div>
            {!isPro && isFree ? <UpgradeButton className="button button-secondary" /> : null}
          </div>

          {!isPro && isGuestMode && guestPreviewContacts.length > 0 ? (
            <div className="conversation-prep-list">
              {guestPreviewContacts.map((contact) => {
                const prep = getConversationPrep(contact);

                return (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="conversation-prep-card"
                  >
                    <div className="action-card-top">
                      <div>
                        <h3>{contact.name}</h3>
                        <p>{formatProfessionalSummary(contact)}</p>
                      </div>
                      <span className="status-pill status-neutral">Preview</span>
                    </div>

                    <div className="prep-meta-grid">
                      <div>
                        <p className="prep-label">Last talked</p>
                        <p className="list-card-meta">
                          {getLastContactDate(contact)
                            ? formatDate(getLastContactDate(contact))
                            : "No date yet"}
                        </p>
                      </div>

                      <div>
                        <p className="prep-label">Topic preview</p>
                        <p className="list-card-meta">
                          {prep.keyTopics[0] || "Your notes will show up here"}
                        </p>
                      </div>

                      <div className="prep-meta-wide prep-message-card">
                        <p className="prep-label prep-emphasis-label">Preview: What to say next</p>
                        <p className="prompt-copy">You could say:</p>
                        <p className="list-card-meta">
                          {getPreviewText(prep.suggestedMessage, 16)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : !isPro ? (
            <ProLockCard
              title={
                isGuestMode
                  ? "Add up to 3 demo contacts to preview what to say next"
                  : "Unlock smarter follow-ups with Pro"
              }
              description={
                isGuestMode
                  ? "Guests can preview suggested follow-ups and prep on the first 3 contacts they add. Full insights stay on Pro."
                  : "Pro gives you AI-powered follow-ups, quick talking points, and prep notes before you reconnect."
              }
            />
          ) : prepContacts.length === 0 ? (
            <p className="section-copy">
              Once you schedule a follow-up, Keeply will help you prep here.
            </p>
          ) : (
            <div className="conversation-prep-list">
              {prepContacts.map((contact) => {
                const prep = getConversationPrep(contact);

                return (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="conversation-prep-card"
                  >
                    <div className="action-card-top">
                      <div>
                        <h3>{contact.name}</h3>
                        <p>{formatProfessionalSummary(contact)}</p>
                      </div>
                      <span className="status-pill status-neutral">
                        {contact.nextFollowUpDate
                          ? formatOptionalDate(contact.nextFollowUpDate)
                          : "Prep"}
                      </span>
                    </div>

                    <div className="prep-meta-grid">
                      <div>
                        <p className="prep-label">Last talked</p>
                        <p className="list-card-meta">
                          {getLastContactDate(contact)
                            ? formatDate(getLastContactDate(contact))
                            : "No date yet"}
                        </p>
                      </div>

                      <div>
                        <p className="prep-label">Topics</p>
                        <p className="list-card-meta">
                          {prep.keyTopics.slice(0, 2).join(" • ") || "No topics yet"}
                        </p>
                      </div>

                      <div className="prep-meta-wide prep-message-card">
                        <p className="prep-label prep-emphasis-label">What to say next</p>
                        <p className="prompt-copy">You could say:</p>
                        <p className="list-card-meta">
                          {prep.followUpTalkingPoints[0] || prep.suggestedMessage}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </article>

        <article className="content-panel dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">New additions</p>
              <h2>Recently added contacts</h2>
            </div>
            <Link href="/contacts/new" className="text-link">
              Add another
            </Link>
          </div>

          {recentlyAddedContacts.length === 0 ? (
            <EmptyState
              title="No contacts added yet"
              description="Add someone you met recently. Keeply will help you remember what to say next."
              actionLabel="Add your first contact"
              actionHref="/contacts/new"
            />
          ) : (
            <div className="action-list">
              {recentlyAddedContacts.map((contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="action-card">
                  <div className="action-card-top">
                    <div>
                      <h3>{contact.name}</h3>
                      <p>{formatProfessionalSummary(contact)}</p>
                    </div>
                    <span className="status-pill status-success">New</span>
                  </div>
                  <p className="list-card-meta">
                    Added from {contact.whereWeMet} on {formatDate(contact.dateMet)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
      ) : null}
    </div>
  );
}
