import Link from 'next/link';

/** One wordmark for public pages and the classroom workspace. */
export default function Brand({ className = "" }: { className?: string }) {
  return <Link href="/" className={`site-brand ${className}`} aria-label="Counterfactual Worlds home">
    Counterfactual <span>Worlds</span>
  </Link>;
}
