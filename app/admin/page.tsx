"use client";

import { useEffect, useState } from "react";

type DeletionRequest = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  status: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
};

export default function AdminPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState("");

  useEffect(() => {
    async function loadRequests() {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/deletion-requests");
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        requests?: DeletionRequest[];
      };

      if (!response.ok || !result.success) {
        setError(result.error || "We couldn't load the admin queue.");
        setIsLoading(false);
        return;
      }

      setRequests(result.requests ?? []);
      setIsLoading(false);
    }

    void loadRequests();
  }, []);

  async function handleApproveAndDelete(userId: string) {
    setStatus("");
    setError("");
    setActiveUserId(userId);

    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    setActiveUserId("");

    if (!response.ok || !result.success) {
      setError(result.error || "We couldn't delete this account.");
      return;
    }

    setRequests((current) => current.filter((request) => request.user_id !== userId));
    setStatus("Account deleted successfully.");
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div className="page-header-content-block">
          <p className="eyebrow">Admin</p>
          <h1>Deletion requests</h1>
          <p className="section-copy">
            Review pending requests and permanently remove accounts from the backend.
          </p>
        </div>
      </section>

      {status ? (
        <section className="content-panel">
          <p className="helper-text">{status}</p>
        </section>
      ) : null}

      {error ? (
        <section className="content-panel">
          <p className="auth-error">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="content-panel">
          <p className="section-copy">Loading the admin queue...</p>
        </section>
      ) : requests.length === 0 ? (
        <section className="content-panel">
          <p className="section-copy">No deletion requests are pending right now.</p>
        </section>
      ) : (
        <section className="list-grid">
          {requests.map((request) => (
            <article key={request.id} className="content-panel admin-request-card">
              <p className="eyebrow">Deletion request</p>
              <h2>{request.name || request.email || request.user_id}</h2>
              <p className="section-copy">{request.email || "No email on file"}</p>
              <p className="helper-text">User id: {request.user_id}</p>
              <p className="helper-text">
                Requested on{" "}
                {request.requested_at
                  ? new Date(request.requested_at).toLocaleDateString()
                  : "Unknown date"}
              </p>
              <p className="helper-text">Status: {request.status || "pending"}</p>
              <div className="form-actions inline-follow-up-actions">
                <button
                  type="button"
                  className="button danger-button"
                  disabled={activeUserId === request.user_id}
                  onClick={() => handleApproveAndDelete(request.user_id)}
                >
                  {activeUserId === request.user_id
                    ? "Deleting..."
                    : "Approve & Delete Account"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
