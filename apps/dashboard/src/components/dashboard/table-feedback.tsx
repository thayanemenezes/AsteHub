import { AiOutlineInbox } from "react-icons/ai";
import styles from "./table-feedback.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
}

interface TableLoadingStateProps {
  label: string;
  columns: number;
  rows?: number;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section aria-labelledby="empty-state-heading" className={styles.emptyState}>
      <span aria-hidden="true" className={styles.emptyIcon}>
        <AiOutlineInbox size={22} />
      </span>
      <h2 id="empty-state-heading">{title}</h2>
      <p>{description}</p>
    </section>
  );
}

export function TableLoadingState({
  label,
  columns,
  rows = 4,
}: TableLoadingStateProps) {
  return (
    <div aria-label={label} className={styles.loadingCard} role="status">
      <span className={styles.visuallyHidden}>{label}</span>
      <div aria-hidden="true" className={styles.tableViewport}>
        <table className={styles.table}>
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index}>
                  <span className={styles.skeletonHeader} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }, (_, columnIndex) => (
                  <td key={columnIndex}>
                    <span
                      className={`${styles.skeletonCell} ${
                        columnIndex === 0 ? styles.skeletonCellShort : ""
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
