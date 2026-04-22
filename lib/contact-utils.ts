import type { Contact } from "@/lib/types";

type ConversationPrep = {
  recentInteractionSummary: string;
  keyTopics: string[];
  followUpTalkingPoints: string[];
  suggestedMessage: string;
};

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatOptionalDate(date: string, fallback = "Not scheduled") {
  return date ? formatDate(date) : fallback;
}

export function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

export function formatOptionalDateTime(dateTime: string, fallback = "No reminder set") {
  return dateTime ? formatDateTime(dateTime) : fallback;
}

export function formatProfessionalSummary(contact: Contact) {
  if (contact.role && contact.company) {
    return `${contact.role} at ${contact.company}`;
  }

  if (contact.role) {
    return contact.role;
  }

  if (contact.company) {
    return contact.company;
  }

  return "No company or role added yet";
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function searchContacts(contacts: Contact[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return contacts;
  }

  return contacts.filter((contact) => {
    const searchableText = [
      contact.name,
      contact.company,
      contact.role,
      contact.email,
      contact.phoneNumber,
      contact.school,
      contact.relationshipType,
      ...contact.tags,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return toLocalDateString(new Date());
}

function getEndOfWeekString() {
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  return toLocalDateString(endOfWeek);
}

function getInactiveCutoffString(days: number) {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - days);
  return toLocalDateString(cutoff);
}

export function getLastContactDate(contact: Contact) {
  const interactionDates = contact.interactions.map((interaction) => interaction.date);
  const dates = [contact.dateMet, ...interactionDates].filter(Boolean);

  if (dates.length === 0) {
    return "";
  }

  return [...dates].sort((first, second) => second.localeCompare(first))[0];
}

export function getDaysSinceLastContact(contact: Contact) {
  const lastContactDate = getLastContactDate(contact);

  if (!lastContactDate) {
    return null;
  }

  const now = new Date();
  const then = new Date(`${lastContactDate}T00:00:00`);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.floor((now.getTime() - then.getTime()) / millisecondsPerDay);
}

export function getUpcomingFollowUps(contacts: Contact[]) {
  return [...contacts]
    .filter((contact) => Boolean(contact.nextFollowUpDate))
    .sort((first, second) =>
      first.nextFollowUpDate.localeCompare(second.nextFollowUpDate),
    )
    .slice(0, 6);
}

export function getOverdueFollowUps(contacts: Contact[]) {
  const today = getTodayString();

  return [...contacts]
    .filter((contact) => contact.nextFollowUpDate && contact.nextFollowUpDate < today)
    .sort((first, second) =>
      first.nextFollowUpDate.localeCompare(second.nextFollowUpDate),
    );
}

export function getFollowUpsDueThisWeek(contacts: Contact[]) {
  const today = getTodayString();
  const endOfWeek = getEndOfWeekString();

  return [...contacts]
    .filter(
      (contact) =>
        contact.nextFollowUpDate &&
        contact.nextFollowUpDate >= today &&
        contact.nextFollowUpDate <= endOfWeek,
    )
    .sort((first, second) =>
      first.nextFollowUpDate.localeCompare(second.nextFollowUpDate),
    );
}

export function getInactiveContacts(contacts: Contact[]) {
  const cutoff = getInactiveCutoffString(60);

  return [...contacts]
    .filter((contact) => {
      const lastContactDate = getLastContactDate(contact);
      return lastContactDate && lastContactDate <= cutoff;
    })
    .sort((first, second) =>
      getLastContactDate(first).localeCompare(getLastContactDate(second)),
    );
}

export function getRecentlyAddedContacts(contacts: Contact[]) {
  return [...contacts]
    .filter((contact) => Boolean(contact.dateMet))
    .sort((first, second) => second.dateMet.localeCompare(first.dateMet))
    .slice(0, 6);
}

function getShortSentence(text: string, fallback: string) {
  const firstSentence = text
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find(Boolean);

  return firstSentence || fallback;
}

function uniqueItems(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

export function getConversationPrep(contact: Contact): ConversationPrep {
  const mostRecentInteraction = [...contact.interactions].sort((first, second) =>
    second.date.localeCompare(first.date),
  )[0];

  const recentInteractionSummary = mostRecentInteraction
    ? `${formatDate(mostRecentInteraction.date)}: ${getShortSentence(
        mostRecentInteraction.notes,
        `You last connected during a ${mostRecentInteraction.type}.`,
      )}`
    : getShortSentence(
        contact.notes,
        "No interaction has been logged yet, so lean on your original notes before reaching out.",
      );

  const keyTopics = uniqueItems([
    contact.whereWeMet ? `How you met: ${contact.whereWeMet}` : "",
    contact.relationshipType ? `Relationship: ${contact.relationshipType}` : "",
    ...contact.tags.slice(0, 2).map((tag) => `Tag: ${tag}`),
    getShortSentence(contact.notes, ""),
  ]).slice(0, 4);

  const followUpTalkingPoints = uniqueItems([
    contact.nextFollowUpDate ? "Share a quick update since your last conversation." : "",
    mostRecentInteraction ? `Reference your last ${mostRecentInteraction.type}.` : "",
    contact.company ? `Ask how things are going at ${contact.company}.` : "",
    contact.role ? `Ask about their current work as ${contact.role}.` : "",
    contact.tags[0] ? `Reconnect around ${contact.tags[0]}.` : "",
  ]).slice(0, 4);

  const suggestedMessage = `Hi ${contact.name}, I hope you're doing well. I enjoyed our conversation about ${
    contact.tags[0] || contact.whereWeMet || "your work"
  } and wanted to reconnect. I'd love to hear how things have been going${
    contact.company ? ` at ${contact.company}` : ""
  } and share a quick update on what I've been working on too.`;

  return {
    recentInteractionSummary,
    keyTopics,
    followUpTalkingPoints,
    suggestedMessage,
  };
}
