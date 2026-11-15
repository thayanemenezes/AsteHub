import { hiringSteps, includedServices } from "../content";
import {
  AiOutlineTool,
  AiOutlineFileText,
  AiOutlineCustomerService,
  AiOutlineSafetyCertificate,
  AiOutlineDashboard,
  AiOutlinePhone,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import styles from "./how-it-works.module.css";

const benefitIcons = [
  AiOutlineTool,
  AiOutlineFileText,
  AiOutlineCustomerService,
  AiOutlineSafetyCertificate,
  AiOutlineDashboard,
  AiOutlinePhone,
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className={styles.section}
      aria-label="Como funciona a locação por assinatura"
    >
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Passo a Passo</span>
          <h2 className={styles.title}>
            Seu carro por assinatura, sem complicação
          </h2>
          <p className={styles.subtitle}>
            Entenda como funciona e descubra uma forma mais prática de dirigir.
          </p>
        </div>

        {/* Área A: Etapas da contratação */}
        <div className={styles.areaA}>
          <div className={styles.areaHeader}>
            <span className={styles.areaBadge}>Área A</span>
            <h3 className={styles.areaTitle}>Etapas da contratação</h3>
            <p className={styles.areaText}>
              Do primeiro contato à entrega das chaves, um processo ágil e 100%
              digital.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {hiringSteps.map((step, index) => (
              <div key={step.stepNumber} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>{step.stepNumber}</span>
                  {index < hiringSteps.length - 1 && (
                    <div className={styles.stepLine} />
                  )}
                </div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Área B: O que pode estar incluso */}
        <div className={styles.areaB}>
          <div className={styles.areaHeader}>
            <span className={styles.areaBadge}>Área B</span>
            <h3 className={styles.areaTitle}>O que pode estar incluso</h3>
            <p className={styles.areaText}>
              Benefícios e conveniências reunidos em uma única mensalidade
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
