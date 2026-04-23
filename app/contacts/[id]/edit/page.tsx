"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { useContacts } from "@/components/contacts-provider";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const { contacts, isContactsLoading, contactsError } = useContacts();
  const contact = contacts.find((item) => item.id === params.id);

  if (isContactsLoading) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Edit contact</p>
          <h1>Loading contact...</h1>
          <p className="section-copy">We&apos;re getting this record ready to edit.</p>
        </div>
      </div>
    );
  }

  if (!contact && contactsError) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Edit contact</p>
          <h1>We couldn&apos;t load this contact.</h1>
          <p className="section-copy">{contactsError}</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    notFound();
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <Link href={`/contacts/${contact.id}`} className="text-link">
            Back to contact
          </Link>
          <p className="eyebrow">Edit contact</p>
          <h1>Update {contact.name}&apos;s details</h1>
          <p className="section-copy">
            Refresh the relationship notes and keep this contact record accurate over time.
          </p>
        </div>
      </section>

      <ContactForm mode="edit" initialContact={contact} />
    </div>
  );
}
