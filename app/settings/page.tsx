"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  getLatestDeletionRequest,
  submitDeletionRequest,
} from "@/lib/supabase/deletion-requests";
import { getUserSettings, updateUserSettings } from "@/lib/supabase/settings";
import {
  type AccountDeletionRequest,
  defaultUserSettings,
  type UserSettings,
} from "@/lib/settings";

function normalizeSettings(
  currentUser: { email: string; plan: UserSettings["subscriptionPlan"] } | null,
  storedSettings?: Partial<UserSettings>,
): UserSettings {
  return {
    subscriptionPlan: currentUser?.plan ?? defaultUserSettings.subscriptionPlan,
    notifications: {
      emailNotifications:
        storedSettings?.notifications?.emailNotifications ??
        defaultUserSettings.notifications.emailNotifications,
      smsNotifications:
        storedSettings?.notifications?.smsNotifications ??
        defaultUserSettings.notifications.smsNotifications,
      browserNotifications:
        storedSettings?.notifications?.browserNotifications ??
        defaultUserSettings.notifications.browserNotifications,
      weeklyDigest:
        storedSettings?.notifications?.weeklyDigest ??
        defaultUserSettings.notifications.weeklyDigest,
      notificationEmail:
        storedSettings?.notifications?.notificationEmail?.trim() ||
        currentUser?.email ||
        defaultUserSettings.notifications.notificationEmail,
      notificationPhone:
        storedSettings?.notifications?.notificationPhone ??
        defaultUserSettings.notifications.notificationPhone,
    },
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, isLoading, setPlan, updateAccount } = useAuth();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSubmittingDeletionRequest, setIsSubmittingDeletionRequest] = useState(false);
  const [isLoadingDeletionRequest, setIsLoadingDeletionRequest] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    async function loadSettingsAndDeletionRequest() {
      if (!currentUser) {
        return;
      }

      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      });

      try {
        const nextSettings = await getUserSettings();
        setSettings(normalizeSettings(currentUser, nextSettings));
      } catch (settingsError) {
        setSettings(normalizeSettings(currentUser));
        setError(
          settingsError instanceof Error
            ? settingsError.message
            : "We couldn't load your settings.",
        );
      }

      setIsLoadingDeletionRequest(true);

      try {
        const latestDeletionRequest = await getLatestDeletionRequest();
        setDeletionRequest(latestDeletionRequest);
      } catch (deletionRequestError) {
        setError(
          deletionRequestError instanceof Error
            ? deletionRequestError.message
            : "We couldn't load your deletion request.",
        );
      } finally {
        setIsLoadingDeletionRequest(false);
      }
    }

    if (!currentUser) {
      return;
    }

    setError("");
    void loadSettingsAndDeletionRequest();
  }, [currentUser]);

  const canShowPage = useMemo(() => !isLoading && currentUser, [currentUser, isLoading]);
  const hasPendingDeletionRequest = deletionRequest?.status === "pending";

  function updateProfileField(name: keyof typeof profileForm, value: string) {
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateNotificationField(
    name: keyof UserSettings["notifications"],
    value: string | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [name]: value,
      },
    }));
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setIsSavingProfile(true);

    const result = await updateAccount(profileForm);

    setIsSavingProfile(false);

    if (!result.success) {
      setError(result.error ?? "We couldn't update your account.");
      return;
    }

    setProfileForm((current) => ({
      ...current,
      name: profileForm.name.trim(),
      email: profileForm.email.trim().toLowerCase(),
      phone: profileForm.phone.trim(),
    }));

    setStatus(
      result.requiresEmailConfirmation
        ? "Profile saved. Check your inbox to confirm your new email address."
        : "Profile saved.",
    );
  }

  async function handlePreferencesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    setStatus("");
    setError("");
    setIsSavingPreferences(true);

    const planResult = await setPlan(settings.subscriptionPlan);

    if (!planResult.success) {
      setIsSavingPreferences(false);
      setError(planResult.error ?? "We couldn't update your plan.");
      return;
    }

    try {
      const savedSettings = await updateUserSettings(settings);
      setSettings(savedSettings);
    } catch (settingsSaveError) {
      setIsSavingPreferences(false);
      setError(
        settingsSaveError instanceof Error
          ? settingsSaveError.message
          : "We couldn't save your settings.",
      );
      return;
    }

    setIsSavingPreferences(false);
    setStatus("Settings saved.");
  }

  async function handleDeleteRequest() {
    if (!currentUser) {
      return;
    }

    const confirmed = window.confirm(
      "This will submit an account deletion request for admin review. Your Keeply account and saved data will be queued for deletion within 48 hours. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setStatus("");
    setError("");
    setIsSubmittingDeletionRequest(true);

    try {
      const nextRequest = await submitDeletionRequest({
        name: currentUser.name,
        email: currentUser.email,
      });
      setDeletionRequest(nextRequest);
    } catch (requestError) {
      setIsSubmittingDeletionRequest(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't submit your deletion request right now.",
      );
      return;
    }

    setIsSubmittingDeletionRequest(false);
    setStatus(
      "Your deletion request was submitted. It is visible only to you in Settings while it is pending admin review.",
    );
  }

  if (!canShowPage) {
    return (
      <div className="empty-page">
        <div className="content-panel">
          <p className="eyebrow">Settings</p>
          <h1>Loading your account settings...</h1>
          <p className="section-copy">
            We&apos;re getting your Keeply account ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Manage your Keeply account</h1>
          <p className="section-copy">
            Update your profile, choose a subscription tier, and decide how you want
            reminders to reach you.
          </p>
        </div>
      </section>

      {(status || error) && (
        <section className="content-panel">
          <p className={error ? "auth-error" : "helper-text"}>{error || status}</p>
        </section>
      )}

      <div className="settings-grid">
        <section className="form-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Account details</h2>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <div className="field">
              <label htmlFor="settings-name">Name</label>
              <input
                id="settings-name"
                required
                value={profileForm.name}
                onChange={(event) => updateProfileField("name", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="settings-email">Email</label>
              <input
                id="settings-email"
                type="email"
                required
                value={profileForm.email}
                onChange={(event) => updateProfileField("email", event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="settings-phone">Phone Number</label>
              <input
                id="settings-phone"
                value={profileForm.phone}
                onChange={(event) => updateProfileField("phone", event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="button button-primary" disabled={isSavingProfile}>
                Save profile
              </button>
            </div>
          </form>
        </section>

        <section className="form-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Subscription</p>
              <h2>Plan and notifications</h2>
            </div>
          </div>

          <form className="settings-form" onSubmit={handlePreferencesSubmit}>
            <div className="field">
              <label htmlFor="subscription-plan">Subscription</label>
              <select
                id="subscription-plan"
                value={settings.subscriptionPlan}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    subscriptionPlan: event.target.value as UserSettings["subscriptionPlan"],
                  }))
                }
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
              <p className="helper-text">
                This updates your Keeply plan in Supabase. For now, pricing is simulated.
              </p>
              <Link href="/pricing" className="text-link">
                View plan comparison
              </Link>
            </div>

            <div className="field">
              <label htmlFor="notification-email">Notification Email</label>
              <input
                id="notification-email"
                type="email"
                value={settings.notifications.notificationEmail}
                onChange={(event) =>
                  updateNotificationField("notificationEmail", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="notification-phone">Notification Phone Number</label>
              <input
                id="notification-phone"
                value={settings.notifications.notificationPhone}
                onChange={(event) =>
                  updateNotificationField("notificationPhone", event.target.value)
                }
                placeholder="Optional"
              />
            </div>

            <div className="settings-checkboxes">
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(event) =>
                    updateNotificationField("emailNotifications", event.target.checked)
                  }
                />
                <span>Email reminders</span>
              </label>

              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(event) =>
                    updateNotificationField("smsNotifications", event.target.checked)
                  }
                />
                <span>Text reminders</span>
              </label>

              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={settings.notifications.browserNotifications}
                  onChange={(event) =>
                    updateNotificationField("browserNotifications", event.target.checked)
                  }
                />
                <span>Browser notifications</span>
              </label>

              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyDigest}
                  onChange={(event) =>
                    updateNotificationField("weeklyDigest", event.target.checked)
                  }
                />
                <span>Weekly catch-up digest</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={isSavingPreferences}
              >
                Save settings
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="form-panel danger-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Danger Zone</p>
            <h2>Request account deletion</h2>
          </div>
        </div>

        <p className="section-copy">
          Submit a deletion request and an admin will review it. Your Keeply account and
          saved data will be removed within 48 hours.
        </p>

        {isLoadingDeletionRequest ? (
          <div className="deletion-request-card">
            <p className="prep-label">Loading deletion request</p>
            <p className="helper-text">Checking whether you already have a request pending.</p>
          </div>
        ) : deletionRequest ? (
          <div className="deletion-request-card">
            <p className="prep-label">
              {hasPendingDeletionRequest ? "Deletion request pending" : "Latest deletion request"}
            </p>
            <p className="helper-text">
              Requested on{" "}
              {new Date(deletionRequest.requestedAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              . This status is visible only to you while the request is under review.
            </p>
            <p className="helper-text">
              Status: <strong>{deletionRequest.status}</strong>
            </p>
            {deletionRequest.reviewedAt ? (
              <p className="helper-text">
                Reviewed on{" "}
                {new Date(deletionRequest.reviewedAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                .
              </p>
            ) : null}
            {deletionRequest.reviewNotes ? (
              <p className="helper-text">{deletionRequest.reviewNotes}</p>
            ) : (
              <p className="helper-text">
                A Keeply admin should review this request within 48 hours.
              </p>
            )}
          </div>
        ) : null}

        <div className="form-actions">
          <button
            type="button"
            className="button danger-button"
            disabled={isSubmittingDeletionRequest || hasPendingDeletionRequest}
            onClick={handleDeleteRequest}
          >
            {hasPendingDeletionRequest ? "Deletion request submitted" : "Request account deletion"}
          </button>
        </div>
      </section>
    </div>
  );
}
