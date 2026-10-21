import type { ReactNode } from "react";
import type { DashboardIconName } from "./navigation";

const iconPaths: Record<DashboardIconName, ReactNode> = {
  overview: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  vehicle: (
    <>
      <path d="m5 11 1.5-4h11l1.5 4" />
      <path d="M4 11h16v7H4z" />
      <path d="M7 18v2m10-2v2M4 14h2m12 0h2" />
    </>
  ),
  category: (
    <>
      <path d="M12 3.5 20.5 12 12 20.5 3.5 12z" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  location: (
    <>
      <path d="M19 10c0 5-7 10.5-7 10.5S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  site: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17" />
    </>
  ),
  lead: (
    <>
      <path d="M4 5.5h16v11H9l-5 3z" />
      <path d="M8 9.5h8m-8 3h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19zM16 5.5a3 3 0 0 1 0 5.8m1 2h1a3.5 3.5 0 0 1 3.5 3.5V19H18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.1.9-1.2 2.1-1.4-.5a7.5 7.5 0 0 1-1.8 1l-.3 1.5h-2.4l-.3-1.5a7.5 7.5 0 0 1-1.8-1l-1.4.5-1.2-2.1 1.1-.9a7.5 7.5 0 0 1 0-2l-1.1-.9 1.2-2.1 1.4.5a7.5 7.5 0 0 1 1.8-1l.3-1.5h2.4l.3 1.5a7.5 7.5 0 0 1 1.8 1l1.4-.5 1.2 2.1-1.1.9a7.5 7.5 0 0 1 0 2Z" />
    </>
  ),
};

export function DashboardIcon({
  name,
  className,
}: {
  name: DashboardIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}
