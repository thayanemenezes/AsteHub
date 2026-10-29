import styles from "./field-error.module.css";

interface FieldErrorProps {
  id: string;
  message?: string;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <span className={styles.error} id={id} role="alert">
      {message}
    </span>
  );
}
