"use client";

import { useState } from "react";
import Link from "next/link";
import { UpgradeButton } from "@/components/upgrade-button";
import { useAuth } from "@/components/auth-provider";
import { EmptyState } from "@/components/empty-state";
import { useContacts } from "@/components/contacts-provider";
import {
  formatDate,
  formatOptionalDate,
  getInitials,
  getPrioritySortedContacts,
  getRelationshipStrengthLabel,
  searchContacts,
} from "@/lib/contact-utils";
import { isProPlan } from "@/lib/plans";

export default function ContactsPage() {
  const { currentUser } = useAuth();
  const isPro = isProPlan(currentUser?.plan);
  const { contacts, guestContactsRemaining, isGuestMode, isContactsLoading, contactsError } =
    useContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const prioritizedContacts = isPro ? getPrioritySortedContacts(contacts) : contacts;
  const filteredContacts = searchContacts(prioritizedContacts, searchQuery);

  return (
    <div className="page-stack">
      <section className="page-header page-header-balanced">
        <div className="page-header-content-block">
          <p className="eyebrow">Contacts</p>
          <h1>All relationships in one place</h1>
          <p className="section-copy">
            Browse your network, review notes, and jump into the next best follow-up.
          </p>
        </div>
        <div className="page-header-side-action">
          <Link className="button button-primary page-header-inline-action" href="/contacts/new">
            Add Contact
          </Link>
        </div>
      </section>

      <section className="content-panel search-panel">
        <div className="field">
          <label htmlFor="contact-search">Search contacts</label>
          <input
            id="contact-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, company, role, school, or tag"
          />
          <p className="helper-text">
            Try searching by name, company, role, school, or tag.
          </p>
        </div>
      </section>

      <p className="helper-text table-hint">
        Click a contact to view notes and prep your next conversation.
      </p>

      {contactsError ? (
        <section className="content-panel">
          <p className="auth-error">{contactsError}</p>
        </section>
      ) : null}

      {isGuestMode && guestContactsRemaining === 0 ? (
        <section className="trial-banner demo-limit-banner">
          <div>
            <p className="eyebrow">Demo limit reached</p>
            <p className="section-copy">
              You&apos;ve used all 3 demo contacts. Create an account to keep building your
              own workspace, or view Pro for the full experience.
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

      {isPro ? null : (
        <section className="content-panel pro-inline-banner">
          <div>
            <p className="eyebrow">Pro sorting</p>
            <p className="section-copy">
              {isGuestMode
                ? "Priority sorting is reserved for Pro after you create an account."
                : "Upgrade to sort contacts by overdue follow-ups and your most important relationships."}
            </p>
          </div>
          {isGuestMode ? (
            <Link href="/signup" className="button button-secondary">
              Sign up to continue
            </Link>
          ) : (
            <UpgradeButton className="button button-secondary" />
          )}
        </section>
      )}

      {isContactsLoading ? (
        <section className="content-panel">
          <p className="eyebrow">Contacts</p>
          <h2>Loading your contacts...</h2>
          <p className="section-copy">We&apos;re pulling in your private workspace now.</p>
        </section>
      ) : contacts.length === 0 ? (
        <EmptyState
          title="Your contact list is empty"
          description="Add someone you met recently. Keeply will help you remember what to say next."
          actionLabel="Add Contact"
          actionHref="/contacts/new"
        />
      ) : filteredContacts.length === 0 ? (
        <section className="content-panel">
          <p className="eyebrow">No matches</p>
          <h2>No contacts matched your search.</h2>
          <p className="section-copy">
            Try a different name, company, role, school, or tag.
          </p>
        </section>
      ) : (
        <section className="table-panel">
          <div className="contacts-table">
            <div className="contacts-table-row contacts-table-head">
              <span>Name</span>
              <span>Company</span>
              <span>Date met</span>
              {isPro ? <span>Priority</span> : null}
              <span>Next follow-up</span>
              <span />
            </div>

            {filteredContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="contacts-table-row contacts-table-link"
              >
                <span className="contact-name-cell">
                  <span className="avatar-circle">{getInitials(contact.name)}</span>
                  <span className="contact-name-copy">
                    <strong className="contact-name-text">{contact.name}</strong>
                    <small>{contact.role || "Not added yet"}</small>
                  </span>
                </span>
                <span>{contact.company || "Not added yet"}</span>
                <span>{contact.dateMet ? formatDate(contact.dateMet) : "Not added yet"}</span>
                {isPro ? <span>{getRelationshipStrengthLabel(contact)}</span> : null}
                <span>{formatOptionalDate(contact.nextFollowUpDate)}</span>
                <span className="view-cell">View →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
