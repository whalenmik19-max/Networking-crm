"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { useContacts } from "@/components/contacts-provider";
import {
  formatDate,
  formatOptionalDate,
  formatProfessionalSummary,
  getFollowUpsDueThisWeek,
  getInactiveContacts,
  getLastContactDate,
  getOverdueFollowUps,
  getRecentlyAddedContacts,
} from "@/lib/contact-utils";

export default function DashboardPage() {
  const { contacts } = useContacts();
  const overdueFollowUps = getOverdueFollowUps(contacts);
  const dueThisWeek = getFollowUpsDueThisWeek(contacts);
  const inactiveContacts = getInactiveContacts(contacts);
  const recentlyAddedContacts = getRecentlyAddedContacts(contacts);

  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Version 1 dashboard</p>
          <h1>Stay warm with the people in your network.</h1>
          <p className="hero-copy">
            Track where you met, remember key notes, and keep up with follow-ups
            before opportunities go cold.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/contacts/new">
            Add a contact
          </Link>
          <Link className="button button-secondary" href="/contacts">
            View all contacts
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <SectionCard title="Total contacts" value={String(contacts.length)} />
        <SectionCard title="Overdue" value={String(overdueFollowUps.length)} />
        <SectionCard title="Due this week" value={String(dueThisWeek.length)} />
      </section>

      <section className="dashboard-grid">
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
              description="Start your CRM with the first person you want to stay in touch with."
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
    </div>
  );
}
