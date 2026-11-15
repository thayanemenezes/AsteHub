"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMonthly, type Vehicle } from "../content";
import { useQuote } from "./quote-context";
import { AiOutlineInfoCircle } from "react-icons/ai";
import styles from "./vehicle-card.module.css";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { openQuote } = useQuote();

  return (
    <article className={styles.card}>
      <Link
        href={`/veiculos/${vehicle.id}`}
        className={styles.media}
        aria-label={`Ver página de detalhes de ${vehicle.brand} ${vehicle.model}`}
      >
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className={styles.photo}
        />
        <span className={styles.badge}>{vehicle.category}</span>
      </Link>

      <div className={styles.body}>
        <div className={styles.titleGroup}>
          <span className={styles.brand}>{vehicle.brand}</span>
          <h3 className={styles.model}>
            <Link href={`/veiculos/${vehicle.id}`} className={styles.titleLink}>
              {vehicle.model}
            </Link>
          </h3>
        </div>

        <div className={styles.features}>
          <span className={styles.featureItem}>{vehicle.transmission}</span>
          <span className={styles.divider}>•</span>
          <span className={styles.featureItem}>{vehicle.fuel}</span>
          <span className={styles.divider}>•</span>
          <span className={styles.featureItem}>{vehicle.seats}</span>
        </div>

        <div className={styles.pricing}>
          <span className={styles.priceLabel}>Mensalidade a partir de</span>
          <p className={styles.priceValue}>
            <strong>{formatMonthly(vehicle.price)}</strong>
            <span className={styles.period}>/mês*</span>
          </p>
          <span className={styles.disclaimer}>
            *Valor ilustrativo referencial
          </span>
        </div>

        <div className={styles.cardActions}>
          <Link
            href={`/veiculos/${vehicle.id}`}
            className={styles.detailsButton}
            aria-label={`Ver detalhes completos de ${vehicle.brand} ${vehicle.model}`}
          >
            <AiOutlineInfoCircle className={styles.btnIcon} />
            Ver detalhes
          </Link>

          <button
            type="button"
            className={styles.proposeButton}
            onClick={() => openQuote(vehicle.id)}
            aria-label={`Solicitar proposta para ${vehicle.brand} ${vehicle.model}`}
          >
            Assinar
          </button>
        </div>
      </div>
    </article>
  );
}
