import type { ReactNode } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import styles from "./page-heading.module.css";

interface PageHeadingSearch {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

interface PageHeadingProps {
  headingId: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: ReactNode;
  onAction: () => void;
  actionDisabled?: boolean;
  search?: PageHeadingSearch;
}

export function PageHeading({
  headingId,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled = false,
  search,
}: PageHeadingProps) {
  return (
    <header className={styles.heading}>
      <div>
        <h1 id={headingId}>{title}</h1>
        <p>{description}</p>
      </div>
      <div className={styles.actions}>
        {search && (
          <label className={styles.search}>
            <AiOutlineSearch aria-hidden="true" size={16} />
            <input
              aria-label={search.label}
              maxLength={100}
              onChange={(event) => search.onChange(event.currentTarget.value)}
              placeholder={search.placeholder}
              type="search"
              value={search.value}
            />
          </label>
        )}
        <button
          className={styles.actionButton}
          disabled={actionDisabled}
          onClick={onAction}
          type="button"
        >
          {actionIcon}
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
