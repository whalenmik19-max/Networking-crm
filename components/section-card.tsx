type SectionCardProps = {
  title: string;
  value: string;
};

export function SectionCard({ title, value }: SectionCardProps) {
  return (
    <article className="stat-card">
      <p className="eyebrow">{title}</p>
      <p className="stat-value">{value}</p>
    </article>
  );
}
