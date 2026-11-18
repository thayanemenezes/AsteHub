"use client";

import type { MouseEvent, ReactNode } from "react";
import styles from "./dialog-backdrop.module.css";

interface DialogBackdropProps {
  children: ReactNode;
  onClose: () => void;
}

export function DialogBackdrop({
  children,
  onClose,
}: DialogBackdropProps) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={styles.backdrop}
      data-testid="dialog-backdrop"
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
