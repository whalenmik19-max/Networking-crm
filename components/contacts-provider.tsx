"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { sampleContactIds, sampleContacts } from "@/lib/sample-contacts";
import {
  addContact as addSupabaseContact,
  deleteContact as deleteSupabaseContact,
  getContacts as getSupabaseContacts,
  updateContact as updateSupabaseContact,
} from "@/lib/supabase/contacts";
import {
  addInteraction as addSupabaseInteraction,
  getInteractions as getSupabaseInteractions,
} from "@/lib/supabase/interactions";
import {
  addReminder as addSupabaseReminder,
  deleteReminder as deleteSupabaseReminder,
  getReminders as getSupabaseReminders,
  type Reminder,
} from "@/lib/supabase/reminders";
import type { Contact, NewContact, NewInteraction, RelationshipType } from "@/lib/types";

type ContactsContextValue = {
  contacts: Contact[];
  isGuestMode: boolean;
  canAddContact: boolean;
  guestContactsRemaining: number;
  isContactsLoading: boolean;
  contactsError: string;
  addContact: (contact: NewContact) => Promise<Contact | undefined>;
  updateContact: (contactId: string, updates: NewContact) => Promise<Contact | undefined>;
  deleteContact: (contactId: string) => Promise<void>;
  addInteraction: (contactId: string, interaction: NewInteraction) => Promise<Contact | undefined>;
  updateReminder: (contactId: string, reminderAt: string) => Promise<void>;
  clearCurrentUserContacts: () => void;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);
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
  const [signedInContacts, setSignedInContacts] = useState<Contact[]>([]);
  const [guestContacts, setGuestContacts] = useState<Contact[]>(sampleContacts);
  const [hasLoadedGuestContacts, setHasLoadedGuestContacts] = useState(false);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [signedInReminders, setSignedInReminders] = useState<Reminder[]>([]);

  const contacts = currentUser ? signedInContacts : guestContacts;
  const guestCreatedContactsCount = guestContacts.filter(
    (contact) => !sampleContactIds.has(contact.id),
  ).length;
  const guestContactsRemaining = Math.max(guestContactLimit - guestCreatedContactsCount, 0);
  const canAddContact = !isGuestMode || guestContactsRemaining > 0;

  const loadSignedInContacts = useCallback(async () => {
    if (!currentUser) {
      setSignedInContacts([]);
      setSignedInReminders([]);
      setContactsError("");
      setIsContactsLoading(false);
      return [];
    }

    setIsContactsLoading(true);
    setContactsError("");

    try {
      const nextContacts = await getSupabaseContacts();
      const [interactionsByContact, reminders] = await Promise.all([
        Promise.all(
          nextContacts.map(async (contact: Contact) => ({
            contactId: contact.id,
            interactions: await getSupabaseInteractions(contact.id),
          })),
        ),
        getSupabaseReminders(),
      ]);

      const contactsWithDetails = nextContacts.map((contact: Contact) => {
        const matchingInteractions = interactionsByContact.find(
          (entry: { contactId: string; interactions: Contact["interactions"] }) =>
            entry.contactId === contact.id,
        );
        const matchingReminder = reminders.find(
          (reminder: Reminder) => reminder.contactId === contact.id,
        );

        return normalizeContact({
          ...contact,
          interactions: matchingInteractions?.interactions ?? [],
          reminderAt: matchingReminder?.remindAt ?? "",
        });
      });

      setSignedInContacts(contactsWithDetails);
      setSignedInReminders(reminders);
      return contactsWithDetails;
    } catch (error) {
      setContactsError(
        error instanceof Error ? error.message : "We couldn't load your contacts.",
      );
      setSignedInContacts([]);
      setSignedInReminders([]);
      return [];
    } finally {
      setIsContactsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const storedGuestContacts = window.localStorage.getItem(guestStorageKey);

    if (storedGuestContacts) {
      setGuestContacts((JSON.parse(storedGuestContacts) as Partial<Contact>[]).map(normalizeContact));
    }

    setHasLoadedGuestContacts(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedGuestContacts) {
      return;
    }

    window.localStorage.setItem(guestStorageKey, JSON.stringify(guestContacts));
  }, [guestContacts, hasLoadedGuestContacts]);

  useEffect(() => {
    if (!isLoading) {
      void loadSignedInContacts();
    }
  }, [isLoading, loadSignedInContacts]);

  function updateGuestContacts(updater: (contacts: Contact[]) => Contact[]) {
    setGuestContacts((current) => updater(current));
  }

  const value = useMemo<ContactsContextValue>(
    () => ({
      contacts,
      isGuestMode,
      canAddContact,
      guestContactsRemaining,
      isContactsLoading,
      contactsError,
      addContact: async (contact) => {
        setContactsError("");

        if (isGuestMode) {
          if (guestContactsRemaining <= 0) {
            return undefined;
          }

          const newContact: Contact = {
            id: crypto.randomUUID(),
            ...contact,
          };

          updateGuestContacts((current) => [newContact, ...current]);
          return newContact;
        }

        try {
          const newContact = await addSupabaseContact(contact);
          setSignedInContacts((current) => [normalizeContact(newContact), ...current]);
          return normalizeContact(newContact);
        } catch (error) {
          setContactsError(
            error instanceof Error ? error.message : "We couldn't save this contact.",
          );
          return undefined;
        }
      },
      updateContact: async (contactId, updates) => {
        setContactsError("");

        if (isGuestMode) {
          let updatedContact: Contact | undefined;

          updateGuestContacts((current) =>
            current.map((contact) => {
              if (contact.id !== contactId) {
                return contact;
              }

              updatedContact = { ...contact, ...updates };
              return updatedContact;
            }),
          );

          return updatedContact;
        }

        try {
          const updatedContact = await updateSupabaseContact(contactId, updates);
          const normalizedContact = normalizeContact(updatedContact);
          setSignedInContacts((current) =>
            current.map((contact) => (contact.id === contactId ? normalizedContact : contact)),
          );
          return normalizedContact;
        } catch (error) {
          setContactsError(
            error instanceof Error ? error.message : "We couldn't update this contact.",
          );
          return undefined;
        }
      },
      deleteContact: async (contactId) => {
        setContactsError("");

        if (isGuestMode) {
          updateGuestContacts((current) => current.filter((contact) => contact.id !== contactId));
          return;
        }

        try {
          const matchingReminder = signedInReminders.find(
            (reminder) => reminder.contactId === contactId,
          );

          if (matchingReminder) {
            await deleteSupabaseReminder(matchingReminder.id);
            setSignedInReminders((current) =>
              current.filter((reminder) => reminder.id !== matchingReminder.id),
            );
          }

          await deleteSupabaseContact(contactId);
          setSignedInContacts((current) => current.filter((contact) => contact.id !== contactId));
        } catch (error) {
          setContactsError(
            error instanceof Error ? error.message : "We couldn't delete this contact.",
          );
        }
      },
      addInteraction: async (contactId, interaction) => {
        if (isGuestMode) {
          const newInteraction = {
            id: crypto.randomUUID(),
            ...interaction,
          };

          let updatedContact: Contact | undefined;
          const updateList = (current: Contact[]) =>
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

          updateGuestContacts(updateList);
          return updatedContact;
        }

        try {
          const savedInteraction = await addSupabaseInteraction(contactId, interaction);
          const refreshedContacts = await loadSignedInContacts();
          return (
            refreshedContacts.find((contact: Contact) => contact.id === contactId) ??
            normalizeContact({
              id: contactId,
              interactions: [savedInteraction],
            })
          );
        } catch (error) {
          setContactsError(
            error instanceof Error ? error.message : "We couldn't save this interaction.",
          );
          return undefined;
        }
      },
      updateReminder: async (contactId, reminderAt) => {
        setContactsError("");

        if (isGuestMode) {
          updateGuestContacts((current) =>
            current.map((contact) =>
              contact.id === contactId ? { ...contact, reminderAt } : contact,
            ),
          );
          return;
        }

        try {
          const existingReminder = signedInReminders.find(
            (reminder) => reminder.contactId === contactId,
          );

          if (existingReminder) {
            await deleteSupabaseReminder(existingReminder.id);
          }

          let nextReminder: Reminder | undefined;

          if (reminderAt) {
            nextReminder = await addSupabaseReminder(contactId, reminderAt);
          }

          if (nextReminder) {
            setSignedInReminders((current) => {
              const withoutCurrent = current.filter(
                (reminder) => reminder.contactId !== contactId,
              );
              return [...withoutCurrent, nextReminder];
            });
          }

          await loadSignedInContacts();
        } catch (error) {
          setContactsError(
            error instanceof Error ? error.message : "We couldn't save this reminder.",
          );
        }
      },
      clearCurrentUserContacts: () => {
        setSignedInContacts([]);
        setSignedInReminders([]);
      },
    }),
    [
      canAddContact,
      contacts,
      contactsError,
      signedInReminders,
      guestContactsRemaining,
      isContactsLoading,
      isGuestMode,
      loadSignedInContacts,
    ],
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts() {
  const context = useContext(ContactsContext);

  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }

  return context;
}
