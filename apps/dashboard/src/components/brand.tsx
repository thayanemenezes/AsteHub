export function Brand({ href = "/" }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="AsteHub início">
      <img src="/logo.png" alt="AsteHub" className="brand-mark" />
    </a>
  );
}
