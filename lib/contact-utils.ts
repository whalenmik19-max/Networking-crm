import type { Contact } from "@/lib/types";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function getUpcomingFollowUps(contacts: Contact[]) {
  return [...contacts]
    .filter((contact) => Boolean(contact.nextFollowUpDate))
    .sort((first, second) =>
      first.nextFollowUpDate.localeCompare(second.nextFollowUpDate),
    )
    .slice(0, 6);
}
