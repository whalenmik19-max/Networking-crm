"use client";

import { ContactForm } from "@/components/contact-form";

export default function NewContactPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Add contact</p>
          <h1>Add a new relationship to your CRM</h1>
          <p className="section-copy">
            Capture the basics now so future follow-ups are easier and more personal.
          </p>
        </div>
      </section>

      <ContactForm />
    </div>
  );
}
