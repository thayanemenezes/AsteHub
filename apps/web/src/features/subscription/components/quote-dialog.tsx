"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { AiOutlineClose, AiOutlineCheckCircle, AiOutlineInfoCircle } from "react-icons/ai";
import styles from "./quote-dialog.module.css";

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
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setSelectedVehicle(initialVehicleId ?? "");
  }, [initialVehicleId]);

  useEffect(() => {
    if (!open) {
      setSent(false);
      setSubmitError("");
      return;
    }

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(event.currentTarget);
    const phone = String(formData.get("telefone") ?? "").replace(/\D/g, "");
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(
        `/api/public/${encodeURIComponent(siteSlug)}/leads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactName: formData.get("nome"),
            email: String(formData.get("email") ?? "").trim() || undefined,
            phone,
            message: formData.get("mensagem"),
            ...(selectedVehicle ? { vehicleId: selectedVehicle } : {}),
          }),
        },
      );
      if (!response.ok) {
        setSubmitError(
          response.status === 429
            ? "Muitas solicitações foram enviadas. Tente novamente mais tarde."
            : "Não foi possível enviar sua solicitação. Confira os dados e tente novamente.",
        );
        return;
      }
      setSent(true);
    } catch {
      setSubmitError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 id={titleId}>Solicitar proposta de assinatura</h2>
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

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIconWrap}>
              <AiOutlineCheckCircle className={styles.successIcon} />
            </div>
            <h3>Solicitação enviada!</h3>
            <p className={styles.successText}>
              Obrigado pelo contato. A equipe da locadora poderá retornar pelos
              dados informados.
            </p>
            <div className={styles.demoNotice}>
              <AiOutlineInfoCircle className={styles.noticeIcon} />
              <span>
                Sua solicitação foi encaminhada à locadora e registrada para
                atendimento.
              </span>
            </div>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setSent(false);
                onClose();
              }}
            >
              Concluir
            </button>
          </div>
        ) : (
          <>
            <p className={styles.intro}>
              Preencha os dados para que a locadora possa entrar em contato.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.formLabel}>
                Nome completo *
                <input
                  className={styles.input}
                  name="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </label>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  E-mail
                  <input
                    className={styles.input}
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    maxLength={320}
                  />
                </label>

                <label className={styles.formLabel}>
                  Telefone / WhatsApp *
                  <input
                    className={styles.input}
                    name="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    minLength={8}
                    maxLength={20}
                    required
                  />
                </label>
              </div>

              <label className={styles.formLabel}>
                Como podemos ajudar? *
                <textarea
                  className={styles.textarea}
                  name="mensagem"
                  rows={3}
                  minLength={10}
                  maxLength={1000}
                  required
                  placeholder="Escreva sua mensagem para a locadora."
                />
              </label>
              <input name="vehicleId" type="hidden" value={selectedVehicle} />

              <div className={styles.formDisclaimer}>
                <span>
                  Seus dados serão usados pela locadora para responder a esta
                  solicitação.
                </span>
              </div>

              {submitError && (
                <p className={styles.submitError} role="alert">
                  {submitError}
                </p>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  className={styles.submit}
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Enviando..." : "Enviar solicitação"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
