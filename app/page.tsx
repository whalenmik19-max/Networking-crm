"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { useContacts } from "@/components/contacts-provider";
import { formatDate, getUpcomingFollowUps } from "@/lib/contact-utils";

export default function DashboardPage() {
  const { contacts } = useContacts();
  const upcomingFollowUps = getUpcomingFollowUps(contacts);

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
        <SectionCard
          title="Upcoming follow-ups"
          value={String(upcomingFollowUps.length)}
        />
        <SectionCard
          title="Tagged relationships"
          value={String(contacts.filter((contact) => contact.tags.length > 0).length)}
        />
      </section>

      <section className="content-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Upcoming follow-ups</p>
            <h2>Who should you reach out to next?</h2>
          </div>
          <Link href="/contacts" className="text-link">
            Open contacts
          </Link>
        </div>

        {upcomingFollowUps.length === 0 ? (
          <EmptyState
            title="No follow-ups scheduled yet"
            description="Add a contact and choose a next follow-up date to see reminders here."
            actionLabel="Add your first contact"
            actionHref="/contacts/new"
          />
        ) : (
          <div className="list-grid">
            {upcomingFollowUps.map((contact) => (
              <Link key={contact.id} href={`/contacts/${contact.id}`} className="list-card">
                <div className="list-card-top">
                  <div>
                    <h3>{contact.name}</h3>
                    <p>
                      {contact.role} at {contact.company}
                    </p>
                  </div>
                  <span className="date-chip">{formatDate(contact.nextFollowUpDate)}</span>
                </div>
                <p className="list-card-meta">Met at {contact.whereWeMet}</p>
                <div className="tag-row">
                  {contact.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
