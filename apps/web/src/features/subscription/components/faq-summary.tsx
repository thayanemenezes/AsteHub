"use client";

import { useState } from "react";
import {
  AiOutlinePlus,
  AiOutlineMinus,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { faqs } from "../content";
import styles from "./faq-summary.module.css";

export function FaqSummary() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className={styles.section}
      aria-label="Perguntas frequentes sobre assinatura"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Tire suas dúvidas</span>
          <h2 className={styles.title}>Dúvidas frequentes</h2>
          <p className={styles.subtitle}>
            Respostas claras para as principais perguntas sobre a nossa locação
            de veículos por assinatura.
          </p>
        </div>

        <div
          className={styles.accordion}
          role="region"
          aria-label="Lista de dúvidas"
        >
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={item.question}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
              >
                <h3 className={styles.heading}>
                  <button
                    id={buttonId}
                    type="button"
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                  >
                    <span className={styles.questionText}>
                      <AiOutlineQuestionCircle
                        className={styles.questionIcon}
                      />
                      {item.question}
                    </span>
                    <span className={styles.toggleIcon} aria-hidden="true">
                      {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
                >
                  <p className={styles.answerText}>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
