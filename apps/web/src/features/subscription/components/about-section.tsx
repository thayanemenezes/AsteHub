import Image from "next/image";
import {
  AiOutlineCheckCircle,
  AiOutlineCompass,
  AiOutlineSafetyCertificate,
} from "react-icons/ai";
import styles from "./about-section.module.css";

export function AboutSection() {
  return (
    <section
      id="sobre"
      className={styles.section}
      aria-label="Sobre a nossa empresa de locação"
    >
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Institucional</span>
            <h2 className={styles.title}>
              Mobilidade sob medida pensada para o seu ritmo
            </h2>

            <p className={styles.lead}>
              Acreditamos que dirigir deve ser uma experiência de liberdade,
              conforto e tranquilidade, sem as amarras financeiras e as
              burocracias da posse tradicional de um automóvel.
            </p>

            <p className={styles.text}>
              Nossa operação de locação por assinatura nasceu para simplificar a
              forma como pessoas e empresas se movimentam. Com uma gestão
              automotiva transparente, oferecemos uma frota selecionada de
              veículos modernos, rigorosamente revisados e preparados para
              acompanhar sua rotina nas cidades ou nas estradas.
            </p>

            <div className={styles.pillars}>
              <div className={styles.pillarItem}>
                <div className={styles.pillarIcon}>
                  <AiOutlineSafetyCertificate />
                </div>
                <div>
                  <h3 className={styles.pillarTitle}>Frota certificada</h3>
                  <p className={styles.pillarText}>
                    Veículos com procedência, revisões periódicas e vistoria
                    detalhada de entrega.
                  </p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIcon}>
                  <AiOutlineCompass />
                </div>
                <div>
                  <h3 className={styles.pillarTitle}>Experiência do cliente</h3>
                  <p className={styles.pillarText}>
                    Atendimento próximo e suporte contínuo durante todo o
                    período da sua assinatura.
                  </p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIcon}>
                  <AiOutlineCheckCircle />
                </div>
                <div>
                  <h3 className={styles.pillarTitle}>Transparência total</h3>
                  <p className={styles.pillarText}>
                    Custos claros e previsíveis em uma única mensalidade, sem
                    taxas ocultas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mediaWrap}>
            <div className={styles.imageCard}>
              <Image
                src="/about-drive.jpg"
                alt="Motorista ao volante desfrutando de uma viagem tranquila"
                fill
                sizes="(max-width: 900px) 90vw, 45vw"
                className={styles.photo}
              />
              <div className={styles.badgeCard}>
                <span className={styles.badgeHighlight}>100% digital</span>
                <span className={styles.badgeSub}>
                  Contratação rápida e descomplicada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
