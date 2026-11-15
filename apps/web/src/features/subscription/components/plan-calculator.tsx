"use client";

import { useState } from "react";
import {
  distances,
  estimateMonthly,
  formatMonthly,
  planCategories,
  terms,
  type Distance,
  type Term,
} from "../content";
import { QuoteTrigger } from "./quote-trigger";
import {
  AiOutlineCalculator,
  AiOutlineCheck,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import styles from "./plan-calculator.module.css";

export function PlanCalculator() {
  const [categoryId, setCategoryId] = useState(
    planCategories[0]?.id ?? "hatch",
  );
  const [months, setMonths] = useState<Term>(24);
  const [km, setKm] = useState<Distance>(2000);

  const monthly = estimateMonthly({ categoryId, months, km });
  const selectedCategory = planCategories.find(
    (item) => item.id === categoryId,
  );

  return (
    <section
      id="calculadora"
      className={styles.section}
      aria-label="Calculadora de assinatura de veículos"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Simulador Online</span>
          <h2 className={styles.title}>Monte uma simulação do seu plano</h2>
          <p className={styles.subtitle}>
            Ajuste a categoria, a duração do contrato e a franquia mensal para
            visualizar uma estimativa ilustrativa da sua mensalidade.
          </p>
        </div>

        <div className={styles.calculatorCard}>
          <div className={styles.inputsColumn}>
            {/* Categoria */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                1. Categoria do veículo:
                <span className={styles.fieldSelected}>
                  {selectedCategory?.label}
                </span>
              </label>
              <div className={styles.categoryGrid}>
                {planCategories.map((cat) => {
                  const active = cat.id === categoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryOption} ${active ? styles.optionActive : ""}`}
                      aria-pressed={active}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      <div className={styles.optionHeader}>
                        <strong className={styles.catName}>{cat.label}</strong>
                        {active && (
                          <AiOutlineCheck className={styles.checkIcon} />
                        )}
                      </div>
                      <span className={styles.catDesc}>{cat.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prazo */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                2. Prazo de permanência:
                <span className={styles.fieldSelected}>{months} meses</span>
              </label>
              <div className={styles.pillGroup}>
                {terms.map((term) => {
                  const active = term === months;
                  return (
                    <button
                      key={term}
                      type="button"
                      className={`${styles.pillOption} ${active ? styles.pillActive : ""}`}
                      aria-pressed={active}
                      onClick={() => setMonths(term)}
                    >
                      {term} meses
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Franquia */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                3. Franquia mensal de rodagem:
                <span className={styles.fieldSelected}>
                  {km.toLocaleString("pt-BR")} km/mês
                </span>
              </label>
              <div className={styles.pillGroup}>
                {distances.map((dist) => {
                  const active = dist === km;
                  return (
                    <button
                      key={dist}
                      type="button"
                      className={`${styles.pillOption} ${active ? styles.pillActive : ""}`}
                      aria-pressed={active}
                      onClick={() => setKm(dist)}
                    >
                      {dist.toLocaleString("pt-BR")} km/mês
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resumo e Estimativa */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryBox}>
              <div className={styles.summaryTop}>
                <span className={styles.summaryKicker}>
                  <AiOutlineCalculator className={styles.calcIcon} />
                  Resumo da Simulação
                </span>
                <h3 className={styles.summaryTitle}>Estimativa Mensal</h3>
              </div>

              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Categoria:</span>
                  <strong className={styles.summaryValue}>
                    {selectedCategory?.label}
                  </strong>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Prazo contratual:</span>
                  <strong className={styles.summaryValue}>
                    {months} meses
                  </strong>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Franquia mensal:</span>
                  <strong className={styles.summaryValue}>
                    {km.toLocaleString("pt-BR")} km/mês
                  </strong>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    Serviços inclusos:
                  </span>
                  <strong className={styles.summaryValue}>
                    IPVA, seguro e manutenção
                  </strong>
                </div>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.pricePrefix}>
                  Valor mensal estimado:
                </span>
                <div className={styles.priceBig}>
                  <strong>{monthly ? formatMonthly(monthly) : "—"}</strong>
                  <span>/mês*</span>
                </div>
                <div className={styles.disclaimerNote}>
                  <AiOutlineInfoCircle className={styles.infoIcon} />
                  <span>
                    *Os valores apresentados são simulações demonstrativas para
                    fins ilustrativos e não constituem proposta comercial
                    vinculante.
                  </span>
                </div>
              </div>

              <QuoteTrigger className={styles.quoteCta}>
                Solicitar orçamento
              </QuoteTrigger>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
