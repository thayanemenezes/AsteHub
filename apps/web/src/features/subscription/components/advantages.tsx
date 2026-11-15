import Link from "next/link";
import { advantages } from "../content";
import {
  AiOutlineDollarCircle,
  AiOutlineThunderbolt,
  AiOutlineSwap,
  AiOutlineAppstore,
  AiOutlineCar,
  AiOutlineSafety,
  AiOutlineArrowRight,
} from "react-icons/ai";
import styles from "./advantages.module.css";

const advantageIcons: Record<string, typeof AiOutlineCar> = {
  previsibilidade: AiOutlineDollarCircle,
  praticidade: AiOutlineThunderbolt,
  flexibilidade: AiOutlineSwap,
  conveniencia: AiOutlineAppstore,
  mobilidade: AiOutlineCar,
  tranquilidade: AiOutlineSafety,
};

export function Advantages() {
  return (
    <section
      className={styles.section}
      aria-label="Vantagens de assinar um carro"
    >
      <div className={styles.glow} />
      <div className={styles.container}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>Por que assinar</span>
          <h2 className={styles.title}>Mais liberdade. Menos preocupações.</h2>
          <p className={styles.subtitle}>
            Descubra por que a assinatura é o jeito mais moderno e inteligente
            de ter um carro na sua garagem.
          </p>
        </div>

        <div className={styles.grid}>
          {advantages.map((item) => {
            const Icon = advantageIcons[item.id] ?? AiOutlineCar;
            const isHighlight = item.highlight;

            return (
              <article
                key={item.id}
                className={`${styles.card} ${isHighlight ? styles.cardHighlight : ""}`}
              >
                {isHighlight && (
                  <span className={styles.highlightBadge}>Destaque</span>
                )}
                <div className={styles.iconWrap}>
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </article>
            );
          })}
        </div>

        <div className={styles.ctaWrapper}>
          <Link href="#veiculos" className={styles.secondaryCta}>
            Conhecer opções de assinatura
            <AiOutlineArrowRight className={styles.ctaIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
}
