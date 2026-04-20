import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-page">
      <div className="content-panel">
        <p className="eyebrow">Not found</p>
        <h1>This contact could not be found.</h1>
        <p className="section-copy">
          The record may have been removed or the page link may be outdated.
        </p>
        <Link href="/contacts" className="button button-primary">
          Return to contacts
        </Link>
      </div>
    </div>
  );
}
