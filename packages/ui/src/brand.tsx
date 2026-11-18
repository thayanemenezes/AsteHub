export interface BrandProps {
  href?: string;
  src?: string;
  className?: string;
}

export function Brand({ href = "/", src, className = "" }: BrandProps) {
  return (
    <a className={`brand ${className}`} href={href} aria-label="AsteHub início">
       <img src={src} alt="AsteHub" className="brand-image" style={{ display: "none" }} />
    </a>
  );
}
