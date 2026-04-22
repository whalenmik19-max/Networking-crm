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
  userId: string;
  name: string;
  email: string;
  requestedAt: string;
  status: "pending";
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
