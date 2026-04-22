import Link from "next/link";

type UpgradeButtonProps = {
  label?: string;
  className?: string;
};

export function UpgradeButton({
  label = "Unlock smarter follow-ups with Pro",
  className = "button button-primary",
}: UpgradeButtonProps) {
  return (
    <Link href="/pricing" className={className}>
      {label}
    </Link>
  );
}
