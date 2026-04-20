"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { useContacts } from "@/components/contacts-provider";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const { contacts } = useContacts();
  const contact = contacts.find((item) => item.id === params.id);

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
