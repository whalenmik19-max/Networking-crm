"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { sampleContactIds, sampleContacts } from "@/lib/sample-contacts";
import type {
  Contact,
  NewContact,
  NewInteraction,
  RelationshipType,
} from "@/lib/types";

type ContactsContextValue = {
  contacts: Contact[];
  isGuestMode: boolean;
  canAddContact: boolean;
  guestContactsRemaining: number;
  addContact: (contact: NewContact) => Contact | undefined;
  updateContact: (contactId: string, updates: NewContact) => Contact | undefined;
  deleteContact: (contactId: string) => void;
  addInteraction: (contactId: string, interaction: NewInteraction) => Contact | undefined;
  updateReminder: (contactId: string, reminderAt: string) => void;
  clearCurrentUserContacts: () => void;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);
const storageKey = "networking-crm-contacts-by-user";
const guestStorageKey = "networking-crm-guest-contacts";
const guestContactLimit = 3;

function normalizeContact(contact: Partial<Contact>): Contact {
  return {
    id: contact.id ?? crypto.randomUUID(),
    name: contact.name ?? "",
    company: contact.company ?? "",
    role: contact.role ?? "",
    email: contact.email ?? "",
    phoneNumber: contact.phoneNumber ?? "",
    school: contact.school ?? "",
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
  const { currentUser, isGuestMode, isLoading } = useAuth();
  const [contactsByUser, setContactsByUser] = useState<Record<string, Contact[]>>({});
  const [guestContacts, setGuestContacts] = useState<Contact[]>(sampleContacts);
  const [hasLoadedContacts, setHasLoadedContacts] = useState(false);

  const contacts = currentUser ? contactsByUser[currentUser.id] ?? [] : guestContacts;
  const guestCreatedContactsCount = guestContacts.filter(
    (contact) => !sampleContactIds.has(contact.id),
  ).length;
  const guestContactsRemaining = Math.max(guestContactLimit - guestCreatedContactsCount, 0);
  const canAddContact = !isGuestMode || guestContactsRemaining > 0;

  useEffect(() => {
    const storedContacts = window.localStorage.getItem(storageKey);
    const storedGuestContacts = window.localStorage.getItem(guestStorageKey);

    if (storedContacts) {
      const parsedContacts = JSON.parse(storedContacts) as Record<string, Partial<Contact>[]>;
      const normalizedContacts = Object.fromEntries(
        Object.entries(parsedContacts).map(([userId, userContacts]) => [
          userId,
          userContacts.map(normalizeContact),
        ]),
      );

      setContactsByUser(normalizedContacts);
    }

    if (storedGuestContacts) {
      setGuestContacts((JSON.parse(storedGuestContacts) as Partial<Contact>[]).map(normalizeContact));
    }

    setHasLoadedContacts(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedContacts || isLoading) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(contactsByUser));
  }, [contactsByUser, hasLoadedContacts, isLoading]);

  useEffect(() => {
    if (!hasLoadedContacts) {
      return;
    }

    window.localStorage.setItem(guestStorageKey, JSON.stringify(guestContacts));
  }, [guestContacts, hasLoadedContacts]);

  function updateCurrentUserContacts(updater: (contacts: Contact[]) => Contact[]) {
    if (!currentUser) {
      return;
    }

    setContactsByUser((current) => ({
      ...current,
      [currentUser.id]: updater(current[currentUser.id] ?? []),
    }));
  }

  function updateGuestContacts(updater: (contacts: Contact[]) => Contact[]) {
    setGuestContacts((current) => updater(current));
  }

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        isGuestMode,
        canAddContact,
        guestContactsRemaining,
        addContact: (contact) => {
          if (isGuestMode && guestContactsRemaining <= 0) {
            return undefined;
          }

          const newContact: Contact = {
            id: crypto.randomUUID(),
            ...contact,
          };

          if (isGuestMode) {
            updateGuestContacts((current) => [newContact, ...current]);
          } else {
            updateCurrentUserContacts((current) => [newContact, ...current]);
          }

          return newContact;
        },
        updateContact: (contactId, updates) => {
          let updatedContact: Contact | undefined;

          const updater = (current: Contact[]) =>
            current.map((contact) => {
              if (contact.id !== contactId) {
                return contact;
              }

              updatedContact = {
                ...contact,
                ...updates,
              };

              return updatedContact;
            });

          if (isGuestMode) {
            updateGuestContacts(updater);
          } else {
            updateCurrentUserContacts(updater);
          }

          return updatedContact;
        },
        deleteContact: (contactId) => {
          const updater = (current: Contact[]) =>
            current.filter((contact) => contact.id !== contactId);

          if (isGuestMode) {
            updateGuestContacts(updater);
          } else {
            updateCurrentUserContacts(updater);
          }
        },
        addInteraction: (contactId, interaction) => {
          const newInteraction = {
            id: crypto.randomUUID(),
            ...interaction,
          };

          let updatedContact: Contact | undefined;

          const updater = (current: Contact[]) =>
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
            });

          if (isGuestMode) {
            updateGuestContacts(updater);
          } else {
            updateCurrentUserContacts(updater);
          }

          return updatedContact;
        },
        updateReminder: (contactId, reminderAt) => {
          const updater = (current: Contact[]) =>
            current.map((contact) =>
              contact.id === contactId ? { ...contact, reminderAt } : contact,
            );

          if (isGuestMode) {
            updateGuestContacts(updater);
          } else {
            updateCurrentUserContacts(updater);
          }
        },
        clearCurrentUserContacts: () => {
          if (!currentUser) {
            return;
          }

          setContactsByUser((current) => {
            const nextState = { ...current };
            delete nextState[currentUser.id];
            return nextState;
          });
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
