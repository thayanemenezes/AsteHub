"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { vehicles, terms, distances } from "../content";
import styles from "./quote-dialog.module.css";

interface QuoteDialogProps {
  open: boolean;
  initialVehicleId?: string;
  onClose: () => void;
}

export function QuoteDialog({
  open,
  initialVehicleId,
  onClose,
}: QuoteDialogProps) {
  const titleId = useId();
  const [selectedVehicle, setSelectedVehicle] = useState(
    initialVehicleId ?? vehicles[0]?.id ?? "",
  );
  const [selectedTerm, setSelectedTerm] = useState("24");
  const [selectedKm, setSelectedKm] = useState("2000");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (initialVehicleId) {
      setSelectedVehicle(initialVehicleId);
    }
  }, [initialVehicleId]);

  useEffect(() => {
    if (!open) {
      setSent(false);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
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
            <h3>Proposta demonstrativa registrada!</h3>
            <p className={styles.successText}>
              Obrigado pelo interesse! Esta é uma demonstração de frontend para
              validação da experiência do usuário.
            </p>
            <div className={styles.demoNotice}>
              <AiOutlineInfoCircle className={styles.noticeIcon} />
              <span>
                Nenhum dado pessoal foi enviado para servidores externos. Em
                produção com o ecossistema AsteHub, esta solicitação geraria um
                Lead qualificado no painel da locadora.
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
              Concluir demonstração
            </button>
          </div>
        ) : (
          <>
            <p className={styles.intro}>
              Preencha os dados abaixo para receber uma simulação detalhada com
              as condições do seu plano.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Nome completo *
                  <input
                    className={styles.input}
                    name="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className={styles.formLabel}>
                  E-mail *
                  <input
                    className={styles.input}
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Telefone / WhatsApp *
                  <input
                    className={styles.input}
                    name="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    required
                  />
                </label>

                <label className={styles.formLabel}>
                  Veículo de interesse
                  <select
                    className={styles.select}
                    name="veiculo"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.category})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Prazo pretendido
                  <select
                    className={styles.select}
                    name="prazo"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {terms.map((term) => (
                      <option key={term} value={term}>
                        {term} meses
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.formLabel}>
                  Franquia mensal
                  <select
                    className={styles.select}
                    name="franquia"
                    value={selectedKm}
                    onChange={(e) => setSelectedKm(e.target.value)}
                  >
                    {distances.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist.toLocaleString("pt-BR")} km/mês
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.formLabel}>
                Observações adicionais (opcional)
                <textarea
                  className={styles.textarea}
                  name="mensagem"
                  rows={3}
                  placeholder="Ex: preferência de cor, data prevista para retirada, dúvidas sobre condutor adicional..."
                />
              </label>

              <div className={styles.formDisclaimer}>
                <span>
                  Ambiente de demonstração. Seus dados não serão comercializados
                  nem transmitidos a serviços externos.
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button className={styles.submit} type="submit">
                  Enviar solicitação
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
