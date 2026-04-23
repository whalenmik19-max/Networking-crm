import type { Plan } from "@/lib/plans";

export type NotificationSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
  weeklyDigest: boolean;
  notificationEmail: string;
  notificationPhone: string;
};

export type UserSettings = {
  subscriptionPlan: Plan;
  notifications: NotificationSettings;
};

export type AccountDeletionRequest = {
  id: string;
  userId: string;
  requestedAt: string;
  status: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
};

export const defaultUserSettings: UserSettings = {
  subscriptionPlan: "free",
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    weeklyDigest: true,
    notificationEmail: "",
    notificationPhone: "",
  },
};
