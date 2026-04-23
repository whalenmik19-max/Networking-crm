export const interactionTypes = [
  "coffee chat",
  "networking event",
  "interview",
  "class",
  "referral",
  "email",
  "other",
] as const;

export type InteractionType = string;
export type RelationshipType = string;

export type Interaction = {
  id: string;
  date: string;
  type: InteractionType;
  notes: string;
};

export type Contact = {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phoneNumber: string;
  school: string;
  dateMet: string;
  whereWeMet: string;
  relationshipType: RelationshipType;
  notes: string;
  nextFollowUpDate: string;
  reminderAt: string;
  tags: string[];
  interactions: Interaction[];
};

export type NewContact = Omit<Contact, "id">;
export type NewInteraction = Omit<Interaction, "id">;
