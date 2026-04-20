export type Contact = {
  id: string;
  name: string;
  company: string;
  role: string;
  whereWeMet: string;
  notes: string;
  nextFollowUpDate: string;
  tags: string[];
};

export type NewContact = Omit<Contact, "id">;
