import type { Contact } from "@/lib/types";

export const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "Avery Patel",
    company: "Brightstone Health",
    role: "Product Analyst",
    whereWeMet: "University alumni panel",
    notes:
      "Shared advice on breaking into healthcare tech and offered to review internship applications in the fall.",
    nextFollowUpDate: "2026-04-20",
    tags: ["alumni", "healthtech", "mentor"],
  },
  {
    id: "2",
    name: "Jordan Rivera",
    company: "Northwind Studio",
    role: "UX Designer",
    whereWeMet: "Design meetup downtown",
    notes:
      "We talked about early-career portfolios, coffee chat etiquette, and junior design roles in Chicago.",
    nextFollowUpDate: "2026-04-24",
    tags: ["design", "portfolio"],
  },
  {
    id: "3",
    name: "Maya Thompson",
    company: "Civic Systems",
    role: "Software Engineer",
    whereWeMet: "Hackathon mentor session",
    notes:
      "Encouraged me to stay in touch after finals and suggested a few open-source projects to build credibility.",
    nextFollowUpDate: "2026-05-02",
    tags: ["engineering", "open source"],
  },
];
