"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { useAuth } from "@/components/auth-provider";
import { useContacts } from "@/components/contacts-provider";
import {
  getConversationPrep,
  formatDate,
  formatOptionalDate,
  formatProfessionalSummary,
  getDaysSinceLastContact,
  getFollowUpsDueThisWeek,
  getInactiveContacts,
  getLastContactDate,
  getOverdueFollowUps,
  getRecentlyAddedContacts,
} from "@/lib/contact-utils";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { contacts } = useContacts();
  const overdueFollowUps = getOverdueFollowUps(contacts);
  const dueThisWeek = getFollowUpsDueThisWeek(contacts);
  const inactiveContacts = getInactiveContacts(contacts);
  const recentlyAddedContacts = getRecentlyAddedContacts(contacts);
  const prepContacts = [...overdueFollowUps, ...dueThisWeek]
    .filter((contact, index, allContacts) =>
      allContacts.findIndex((item) => item.id === contact.id) === index,
    )
    .slice(0, 4);

  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Never forget who to follow up with again</h1>
          <p className="hero-copy">
            Keep notes for your future self so every conversation picks up right where
            you left off.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/contacts/new">
            {currentUser ? "Add a contact" : "Add your first contact"}
          </Link>
          {currentUser ? (
            <Link className="button button-secondary" href="/contacts">
              View all contacts
            </Link>
          ) : (
            <Link className="button button-secondary" href="/signup">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <section className="stats-grid">
        <SectionCard title="Total contacts" value={String(contacts.length)} />
        <SectionCard title="Overdue" value={String(overdueFollowUps.length)} />
        <SectionCard title="Due this week" value={String(dueThisWeek.length)} />
      </section>

      <section className="dashboard-grid">
        <article className="content-panel dashboard-panel">
          <p className="dashboard-callout">
            {overdueFollowUps.length > 0
              ? `You should reach out to ${overdueFollowUps.length} ${
                  overdueFollowUps.length === 1 ? "person" : "people"
                } today.`
              : "You are caught up for today."}
          </p>
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
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="action-card">
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
                </Link>
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
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="action-card">
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
                </Link>
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
                  <div className="suggested-follow-up-card">
                    <p className="prep-label">
                      You haven&apos;t talked to {contact.name} in{" "}
                      {getDaysSinceLastContact(contact) ?? 60} days
                    </p>
                    <p className="notes-copy">💬 {getConversationPrep(contact).suggestedMessage}</p>
                  </div>
                </Link>
              ))}
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
              description="Start your Keeply workspace with the first person you want to stay in touch with."
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

      <section className="content-panel dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Prepare</p>
            <h2>Prepare for your next conversation</h2>
          </div>
        </div>

        {prepContacts.length === 0 ? (
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

                    <div className="prep-meta-wide">
                      <p className="prep-label">Suggested follow-up</p>
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
      </section>
    </div>
  );
}
