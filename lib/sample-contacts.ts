import type { Contact } from "@/lib/types";

export const sampleContacts: Contact[] = [
  {
    id: "1",
    name: "Avery Patel",
    company: "Brightstone Health",
    role: "Product Analyst",
    email: "avery.patel@example.com",
    phoneNumber: "(312) 555-0142",
    school: "University of Illinois Chicago",
    dateMet: "2026-03-30",
    whereWeMet: "University alumni panel",
    relationshipType: "alum",
    notes:
      "Shared advice on breaking into healthcare tech and offered to review internship applications in the fall.",
    nextFollowUpDate: "2026-04-20",
    reminderAt: "",
    tags: ["alumni", "healthtech", "mentor"],
    interactions: [
      {
        id: "1-1",
        date: "2026-03-30",
        type: "networking event",
        notes:
          "Met after the alumni panel and asked about how product analysts break into healthcare technology.",
      },
      {
        id: "1-2",
        date: "2026-04-08",
        type: "email",
        notes:
          "Sent a thank-you note and shared my resume for feedback before summer internship applications.",
      },
    ],
  },
  {
    id: "2",
    name: "Jordan Rivera",
    company: "Northwind Studio",
    role: "UX Designer",
    email: "jordan.rivera@example.com",
    phoneNumber: "(773) 555-0191",
    school: "DePaul University",
    dateMet: "2026-04-02",
    whereWeMet: "Design meetup downtown",
    relationshipType: "peer",
    notes:
      "We talked about early-career portfolios, coffee chat etiquette, and junior design roles in Chicago.",
    nextFollowUpDate: "2026-04-24",
    reminderAt: "",
    tags: ["design", "portfolio"],
    interactions: [
      {
        id: "2-1",
        date: "2026-04-02",
        type: "coffee chat",
        notes:
          "Reviewed my portfolio homepage and talked through how to present student work more clearly.",
      },
    ],
  },
  {
    id: "3",
    name: "Maya Thompson",
    company: "Civic Systems",
    role: "Software Engineer",
    email: "maya.thompson@example.com",
    phoneNumber: "(847) 555-0128",
    school: "Northwestern University",
    dateMet: "2026-03-18",
    whereWeMet: "Hackathon mentor session",
    relationshipType: "mentor",
    notes:
      "Encouraged me to stay in touch after finals and suggested a few open-source projects to build credibility.",
    nextFollowUpDate: "2026-05-02",
    reminderAt: "",
    tags: ["engineering", "open source"],
    interactions: [
      {
        id: "3-1",
        date: "2026-03-18",
        type: "class",
        notes:
          "Met during a guest session in class and followed up with a question about contributing to beginner-friendly repos.",
      },
      {
        id: "3-2",
        date: "2026-04-10",
        type: "referral",
        notes:
          "Shared two internship openings and encouraged me to mention the hackathon project in my application.",
      },
    ],
  },
];
