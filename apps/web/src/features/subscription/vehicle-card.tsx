import Image from "next/image";
import Link from "next/link";
import { AiOutlineCar } from "react-icons/ai";
import { QuoteTrigger } from "./components/quote-trigger";
import type { PublicVehicle } from "./public-site-api";
import styles from "./public-site.module.css";

export function PublicVehicleCard({ vehicle }: { vehicle: PublicVehicle }) {
  const image = vehicle.images[0];
  return (
    <article className={styles.vehicleCard}>
      <Link
        aria-label={`Ver ${vehicle.make} ${vehicle.model}`}
        className={styles.vehicleImage}
        href={`/veiculos/${vehicle.id}`}
      >
        {image ? (
          <Image
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 800px) 50vw, 33vw"
            src={image}
            unoptimized
          />
        ) : (
          <AiOutlineCar aria-hidden="true" />
        )}
      </Link>
      <div className={styles.vehicleBody}>
        <span className={styles.vehicleCategory}>
          {vehicle.category?.name ?? "Veículo"}
        </span>
        <h3>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className={styles.vehicleDescription}>
          {vehicle.description ?? `Ano ${vehicle.year}`}
        </p>
        <div className={styles.vehicleActions}>
          <Link href={`/veiculos/${vehicle.id}`}>Ver detalhes</Link>
          <QuoteTrigger className={styles.quoteButton} vehicleId={vehicle.id}>
            Solicitar cotação
          </QuoteTrigger>
        </div>
      </div>
    </article>
  );
}
