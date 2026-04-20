import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <section className="content-panel empty-state">
      <div>
        <p className="eyebrow">Getting started</p>
        <h2>{title}</h2>
        <p className="section-copy">{description}</p>
      </div>
      <Link href={actionHref} className="button button-primary">
        {actionLabel}
      </Link>
    </section>
  );
}
