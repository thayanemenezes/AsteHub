import Image from "next/image";
import Link from "next/link";
import { AiOutlineCar } from "react-icons/ai";
import { QuoteTrigger } from "./components/quote-trigger";
import type { PublicVehicle } from "./public-site-api";
import styles from "./public-site.module.css";

export function VehicleDetailPage({ vehicle }: { vehicle: PublicVehicle }) {
  const image = vehicle.images[0];

  return (
    <main className={styles.page}>
      <p className={styles.pageHeading}>
        <Link className={styles.textLink} href="/veiculos">
          Voltar para o catálogo
        </Link>
      </p>
      <div className={styles.detail}>
        <div className={styles.detailImage}>
          {image ? (
            <Image
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 65vw"
              src={image}
              unoptimized
            />
          ) : (
            <AiOutlineCar aria-hidden="true" size={64} />
          )}
        </div>
        <div className={styles.detailInfo}>
          <span className={styles.eyebrow}>
            {vehicle.category?.name ?? "Veículo"}
          </span>
          <h1>
            {vehicle.make} {vehicle.model}
          </h1>
          <p>
            {vehicle.description ?? "Entre em contato para mais informações."}
          </p>
          <div className={styles.specList}>
            <span>Ano: {vehicle.year}</span>
            {vehicle.series && <span>Versão: {vehicle.series}</span>}
            <span>
              {vehicle.isElectric ? "Elétrico" : "Consulte motorização"}
            </span>
          </div>
          <QuoteTrigger className={styles.primaryLink} vehicleId={vehicle.id}>
            Solicitar cotação
          </QuoteTrigger>
        </div>
      </div>
    </main>
  );
}
