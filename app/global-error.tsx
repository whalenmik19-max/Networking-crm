"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="empty-page">
          <div className="content-panel">
            <p className="eyebrow">App error</p>
            <h1>The app needs a fresh restart.</h1>
            <p className="section-copy">
              {error.message || "A global error occurred while loading the app."}
            </p>
            <button type="button" className="button button-primary" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
