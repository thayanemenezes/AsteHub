import type { ReactNode } from "react";
import styles from "./page-heading.module.css";

interface PageHeadingProps {
  headingId: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
  actionDisabled?: boolean;
}

export function PageHeading({
  headingId,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled = false,
}: PageHeadingProps) {
  return (
    <header className={styles.heading}>
      <div>
        <h1 id={headingId}>{title}</h1>
        <p>{description}</p>
      </div>
      <button
        className={styles.actionButton}
        disabled={actionDisabled}
        onClick={onAction}
        type="button"
      >
        {actionIcon}
        {actionLabel}
      </button>
    </header>
  );
}
