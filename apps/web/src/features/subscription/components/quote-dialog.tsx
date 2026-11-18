"use client";

import { useEffect, useId, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import styles from "./quote-dialog.module.css";
import { QuoteForm } from "./quote-form";

interface QuoteDialogProps {
  open: boolean;
  initialVehicleId?: string;
  siteSlug: string;
  onClose: () => void;
}

export function QuoteDialog({
  open,
  initialVehicleId,
  siteSlug,
  onClose,
}: QuoteDialogProps) {
  const titleId = useId();
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicleId ?? "");

  useEffect(() => {
    setSelectedVehicle(initialVehicleId ?? "");
  }, [initialVehicleId]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <span className={styles.eyebrow}>Atendimento Comercial</span>
            <h2 id={titleId}>Solicitar cotação</h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Fechar modal de orçamento"
            onClick={onClose}
          >
            <AiOutlineClose />
          </button>
        </div>

        <p className={styles.intro}>
          Preencha os dados para que a locadora possa entrar em contato.
        </p>
        <QuoteForm
          siteSlug={siteSlug}
          vehicleId={selectedVehicle || undefined}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
