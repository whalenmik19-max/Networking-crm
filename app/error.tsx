"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="empty-page">
      <div className="content-panel">
        <p className="eyebrow">Something went wrong</p>
        <h1>The page hit an unexpected error.</h1>
        <p className="section-copy">
          {error.message || "Please try refreshing the page."}
        </p>
        <button type="button" className="button button-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
