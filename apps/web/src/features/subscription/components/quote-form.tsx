"use client";

import { useState, type FormEvent } from "react";
import { AiOutlineCheckCircle, AiOutlineInfoCircle } from "react-icons/ai";
import styles from "./quote-dialog.module.css";

interface QuoteFormProps {
  siteSlug: string;
  vehicleId?: string;
  onCancel?: () => void;
}

export function QuoteForm({
  siteSlug,
  vehicleId,
  onCancel,
}: QuoteFormProps) {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
            ...(vehicleId ? { vehicleId } : {}),
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

  if (sent) {
    return (
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
          onClick={onCancel ?? (() => setSent(false))}
        >
          {onCancel ? "Concluir" : "Nova solicitação"}
        </button>
      </div>
    );
  }

  return (
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
      {vehicleId && (
        <input name="vehicleId" type="hidden" value={vehicleId} readOnly />
      )}

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
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
        <button
          className={styles.submit}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando..." : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}
