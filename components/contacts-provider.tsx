"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { sampleContacts } from "@/lib/sample-contacts";
import type {
  Contact,
  NewContact,
  NewInteraction,
  RelationshipType,
} from "@/lib/types";

type ContactsContextValue = {
  contacts: Contact[];
  addContact: (contact: NewContact) => Contact;
  updateContact: (contactId: string, updates: NewContact) => Contact | undefined;
  addInteraction: (contactId: string, interaction: NewInteraction) => Contact | undefined;
  updateReminder: (contactId: string, reminderAt: string) => void;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);
const storageKey = "networking-crm-contacts";

function normalizeContact(contact: Partial<Contact>): Contact {
  return {
    id: contact.id ?? crypto.randomUUID(),
    name: contact.name ?? "",
    company: contact.company ?? "",
    role: contact.role ?? "",
    dateMet: contact.dateMet ?? "",
    whereWeMet: contact.whereWeMet ?? "",
    relationshipType: (contact.relationshipType ?? "other") as RelationshipType,
    notes: contact.notes ?? "",
    nextFollowUpDate: contact.nextFollowUpDate ?? "",
    reminderAt: contact.reminderAt ?? "",
    tags: contact.tags ?? [],
    interactions: contact.interactions ?? [],
  };
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [hasLoadedContacts, setHasLoadedContacts] = useState(false);

  useEffect(() => {
    const storedContacts = window.localStorage.getItem(storageKey);

    if (storedContacts) {
      setContacts((JSON.parse(storedContacts) as Partial<Contact>[]).map(normalizeContact));
    }

    setHasLoadedContacts(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedContacts) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(contacts));
  }, [contacts, hasLoadedContacts]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        addContact: (contact) => {
          const newContact: Contact = {
            id: crypto.randomUUID(),
            ...contact,
          };

          setContacts((current) => [newContact, ...current]);

          return newContact;
        },
        updateContact: (contactId, updates) => {
          let updatedContact: Contact | undefined;

          setContacts((current) =>
            current.map((contact) => {
              if (contact.id !== contactId) {
                return contact;
              }

              updatedContact = {
                ...contact,
                ...updates,
              };

              return updatedContact;
            }),
          );

          return updatedContact;
        },
        addInteraction: (contactId, interaction) => {
          const newInteraction = {
            id: crypto.randomUUID(),
            ...interaction,
          };

          let updatedContact: Contact | undefined;

          setContacts((current) =>
            current.map((contact) => {
              if (contact.id !== contactId) {
                return contact;
              }

              updatedContact = {
                ...contact,
                interactions: [newInteraction, ...contact.interactions].sort((first, second) =>
                  second.date.localeCompare(first.date),
                ),
              };

              return updatedContact;
            }),
          );

          return updatedContact;
        },
        updateReminder: (contactId, reminderAt) => {
          setContacts((current) =>
            current.map((contact) =>
              contact.id === contactId ? { ...contact, reminderAt } : contact,
            ),
          );
        },
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);

  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }

  return context;
}
