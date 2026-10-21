export function Brand({ href = "/" }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="AsteHub início">
      <svg
        aria-hidden="true"
        className="brand-mark"
        fill="none"
        viewBox="0 0 42 42"
      >
        <path
          d="M21 3.5v35M3.5 21h35M8.63 8.63l24.74 24.74m0-24.74L8.63 33.37"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <circle cx="21" cy="21" r="4.25" fill="currentColor" />
        <circle cx="21" cy="3.5" r="2.25" fill="currentColor" />
        <circle cx="38.5" cy="21" r="2.25" fill="currentColor" />
        <circle cx="21" cy="38.5" r="2.25" fill="currentColor" />
        <circle cx="3.5" cy="21" r="2.25" fill="currentColor" />
      </svg>
      <span className="brand-name">AsteHub</span>
    </a>
  );
}
