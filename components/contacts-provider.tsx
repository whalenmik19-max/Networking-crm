"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { sampleContacts } from "@/lib/sample-contacts";
import type { Contact, NewContact } from "@/lib/types";

type ContactsContextValue = {
  contacts: Contact[];
  addContact: (contact: NewContact) => Contact;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);
const storageKey = "networking-crm-contacts";

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === "undefined") {
      return sampleContacts;
    }

    const storedContacts = window.localStorage.getItem(storageKey);
    return storedContacts ? (JSON.parse(storedContacts) as Contact[]) : sampleContacts;
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(contacts));
  }, [contacts]);

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
