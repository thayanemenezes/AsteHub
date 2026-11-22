"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hiringSteps, includedServices } from "../content";
import {
  AiOutlineTool,
  AiOutlineFileText,
  AiOutlineCustomerService,
  AiOutlineSafetyCertificate,
  AiOutlineDashboard,
  AiOutlinePhone,
  AiOutlineInfoCircle,
  AiOutlineCheckCircle,
  AiOutlineCar,
  AiOutlineCalendar,
  AiOutlineThunderbolt,
  AiOutlineKey,
  AiOutlineArrowRight,
} from "react-icons/ai";
import { QuoteTrigger } from "./quote-trigger";
import styles from "./how-it-works.module.css";

const benefitIcons = [
  AiOutlineTool,
  AiOutlineFileText,
  AiOutlineCustomerService,
  AiOutlineSafetyCertificate,
  AiOutlineDashboard,
  AiOutlinePhone,
];

const stepIcons = [
  AiOutlineCar,
  AiOutlineCalendar,
  AiOutlineThunderbolt,
  AiOutlineKey,
];

// Contextual images/banners for each step to make it visual and dynamic
const stepMedia = [
  {
    image: "/vehicles/compass.jpg",
    badge: "Vitrine 0km & Seminovos",
    metric: "Modelos variados",
    tagline: "Escolha inteligente",
  },
  {
    image: "/banners/assinatura.jpg",
    badge: "12, 24 ou 36 Meses",
    metric: "1.000 a 3.000 km/mês",
    tagline: "Total flexibilidade",
  },
  {
    image: "/about-drive.jpg",
    badge: "Análise Rápida & Digital",
    metric: "Sem fiador ou complicação",
    tagline: "Aprovação ágil",
  },
  {
    image: "/banners/incluso.jpg",
    badge: "Chave na Mão",
    metric: "Tudo 100% incluso",
    tagline: "Pronto para rodar",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const currentMedia = stepMedia[activeStep] ?? stepMedia[0]!;
  const currentStep = hiringSteps[activeStep] ?? hiringSteps[0]!;

  return (
    <section
      id="como-funciona"
      className={styles.section}
      aria-label="Como funciona a locação por assinatura"
    >
      <div className={styles.container}>
        {/* Cabeçalho da Seção */}
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Processo Descomplicado</span>
          <h2 className={styles.title}>
            Sua Jornada em 4 Etapas Simples
          </h2>
          <p className={styles.subtitle}>
            Esqueça burocracias de compra e financiamento. Veja como é rápido e
            100% digital sair de carro novo por assinatura.
          </p>
        </div>

        {/* Área A: Etapas da Contratação (Layout Hero & Interactive Journey Timeline) */}
        <div className={styles.journeyShowcase}>
          {/* Lado Esquerdo: Banner do Veículo / Vitrine Ativa */}
          <div className={styles.visualHero}>
            <div className={styles.visualCard}>
              <div className={styles.visualImageWrap}>
                <Image
                  key={currentMedia.image}
                  src={currentMedia.image}
                  alt={`Etapa ${activeStep + 1} - ${currentStep.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className={styles.visualImage}
                  priority={activeStep === 0}
                />
                <div className={styles.visualOverlay} />
              </div>

              {/* Informações Flutuantes no Banner */}
              <div className={styles.visualMetaTop}>
                <span className={styles.visualBadge}>
                  Etapa {currentStep.stepNumber}
                </span>
                
              </div>

              <div className={styles.visualMetaBottom}>
                <div className={styles.visualHighlightBox}>
                  <div className={styles.visualMetricIcon}>
                    <AiOutlineCheckCircle />
                  </div>
                  <div>
                    <span className={styles.visualTagline}>
                      {currentStep.tagline ?? currentMedia.tagline}
                    </span>
                    <strong className={styles.visualHighlightText}>
                      {currentStep.highlight ?? currentMedia.metric}
                    </strong>
                  </div>
                </div>

                <div className={styles.visualActions}>
                  <QuoteTrigger className={styles.visualCta}>
                    <span>Iniciar Contratação</span>
                    <AiOutlineArrowRight />
                  </QuoteTrigger>
                  <Link href="/veiculos" className={styles.visualSecondaryBtn}>
                    Ver Frota
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Trilha Dinâmica / Timeline Interativa de Etapas */}
          <div className={styles.stepsTimeline}>
            <div className={styles.timelineHeader}>
              <span className={styles.timelineKicker}>Fluxo Ágil</span>
              <h3 className={styles.timelineTitle}>
                Da escolha à entrega das chaves
              </h3>
            </div>

            <div className={styles.trackList} role="tablist" aria-label="Etapas de contratação">
              {hiringSteps.map((step, idx) => {
                const isActive = activeStep === idx;
                const isPassed = activeStep > idx;
                const IconComponent = stepIcons[idx] ?? AiOutlineCheckCircle;

                return (
                  <div
                    key={step.stepNumber}
                    role="tab"
                    tabIndex={0}
                    aria-selected={isActive}
                    onClick={() => setActiveStep(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveStep(idx);
                      }
                    }}
                    className={`${styles.trackItem} ${isActive ? styles.trackItemActive : ""} ${
                      isPassed ? styles.trackItemPassed : ""
                    }`}
                  >
                    <div className={styles.trackIndicatorCol}>
                      <div className={styles.indicatorNode}>
                        <span className={styles.nodeNumber}>{step.stepNumber}</span>
                        <IconComponent className={styles.nodeIcon} />
                      </div>
                      {idx < hiringSteps.length - 1 && (
                        <div
                          className={`${styles.connectingRail} ${
                            isPassed || isActive ? styles.connectingRailActive : ""
                          }`}
                        />
                      )}
                    </div>

                    <div className={styles.trackContent}>
                      <div className={styles.trackContentTop}>
                        <span className={styles.trackTag}>
                          {step.tagline ?? `Passo ${idx + 1}`}
                        </span>
                        {isActive && (
                          <span className={styles.activePill}>Em foco</span>
                        )}
                      </div>
                      <h4 className={styles.trackTitle}>{step.title}</h4>
                      <p className={styles.trackText}>{step.text}</p>

                      {step.highlight && (
                        <div className={styles.trackDetailBadge}>
                          <AiOutlineCheckCircle className={styles.trackDetailIcon} />
                          <span>{step.highlight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Área B: O que pode estar incluso */}
        <div className={styles.areaB}>
          <div className={styles.areaHeader}>
            <span className={styles.areaBadge}>Conveniência Total</span>
            <h3 className={styles.areaTitle}>O que está incluso na assinatura</h3>
            <p className={styles.areaText}>
              Todos os custos essenciais integrados em uma única mensalidade fixa e
              previsível.
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {includedServices.map((service, idx) => {
              const Icon = benefitIcons[idx] ?? AiOutlineSafetyCertificate;
              return (
                <div key={service.title} className={styles.benefitCard}>
                  <div className={styles.iconWrap}>
                    <Icon className={styles.benefitIcon} />
                  </div>
                  <div>
                    <h4 className={styles.benefitTitle}>{service.title}</h4>
                    <p className={styles.benefitText}>{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.disclaimerBox}>
            <AiOutlineInfoCircle className={styles.disclaimerIcon} />
            <p className={styles.disclaimerText}>
              <strong>Aviso importante:</strong> As coberturas, serviços
              inclusos e condições podem variar de acordo com o plano, modelo e
              fornecedor contratados. Consulte os detalhes no momento da
              contratação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}