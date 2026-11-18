export function Brand({ href = "/", src }: { href?: string; src?: string }) {
  return (
    <a className="brand" href={href} aria-label="AsteHub início">
      <img src={src} alt="AsteHub" className="brand-image"  />
    </a>
  );
}
