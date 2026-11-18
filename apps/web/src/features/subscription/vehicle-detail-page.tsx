"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineArrowLeft,
  AiOutlineCalendar,
  AiOutlineCar,
  AiOutlineThunderbolt,
} from "react-icons/ai";
import { QuoteForm } from "./components/quote-form";
import { useQuote } from "./components/quote-context";
import type { PublicVehicle } from "./public-site-api";
import styles from "./vehicle-detail-page.module.css";

export function VehicleDetailPage({ vehicle }: { vehicle: PublicVehicle }) {
  const { siteSlug } = useQuote();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = vehicle.images[activeImageIndex];
  const brand = vehicle.make;
  const category = vehicle.category?.name ?? "Veículo";
  const title = `${vehicle.make} ${vehicle.model}`;

  const specifications = [
    { label: "Ano", value: String(vehicle.year), Icon: AiOutlineCalendar },
    { label: "Marca", value: brand, Icon: AiOutlineCar },
    { label: "Categoria", value: category, Icon: AiOutlineCar },
    {
      label: "Motorização",
      value: vehicle.isElectric ? "Elétrico" : "Não elétrico",
      Icon: AiOutlineThunderbolt,
    },
  ];

  return (
    <main className={styles.container}>
      <nav aria-label="Navegação estrutural" className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadLink}>
          Início
        </Link>
        <span className={styles.breadDivider}>/</span>
        <Link href="/veiculos" className={styles.breadLink}>
          Veículos
        </Link>
        <span className={styles.breadDivider}>/</span>
        <span aria-current="page" className={styles.breadCurrent}>
          {vehicle.model}
        </span>
      </nav>

      <div className={styles.backWrap}>
        <Link href="/veiculos" className={styles.backButton}>
          <AiOutlineArrowLeft aria-hidden="true" className={styles.backIcon} />
          Voltar para todos os veículos
        </Link>
      </div>


      <section aria-label={`Detalhes do ${title}`} className={styles.mainGrid}>
        <div className={styles.galleryColumn}>
          <div className={styles.featuredImageWrap}>
            {activeImage ? (
              <>
                <Image
                  src={activeImage}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 65vw"
                  className={styles.featuredImage}
                  unoptimized
                />
                <div className={styles.imageCaptionBar}>
                  <span>{title}</span>
                  <span className={styles.imageCounter}>
                    {activeImageIndex + 1} de {vehicle.images.length}
                  </span>
                </div>
              </>
            ) : (
              <AiOutlineCar
                aria-hidden="true"
                className={styles.imageFallback}
              />
            )}
          </div>

          {vehicle.images.length > 0 && (
            <div
              className={styles.thumbnailsRow}
              role="tablist"
              aria-label="Fotos do veículo"
            >
              {vehicle.images.map((image, index) => {
                const isActive = index === activeImageIndex;
                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Visualizar foto ${index + 1}`}
                    className={`${styles.thumbButton} ${isActive ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="120px"
                      className={styles.thumbImage}
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className={styles.quickSummaryColumn}>
          <section
            id="cotacao"
            className={styles.quoteFormCard}
            aria-labelledby="quote-form-title"
          >
            <div className={`${styles.formHeader} ${styles.quoteFormHeader}`}>
              <span className={styles.formEyebrow}>Atendimento comercial</span>
              <h2 id="quote-form-title" className={styles.formTitle}>
                Solicite uma cotação para o {title}
              </h2>
              <p className={styles.formSubtitle}>
                Informe seus dados e a locadora entrará em contato sobre este
                veículo.
              </p>
            </div>
            <QuoteForm siteSlug={siteSlug} vehicleId={vehicle.id} />
          </section>
        </aside>

        <header className={styles.topHeader}>
          <div className={styles.brandCategory}>
            <span className={styles.brandName}>{brand}</span>
            <span className={styles.categoryBadge}>{category}</span>
          </div>
          <h1 className={styles.vehicleTitle}>{title}</h1>
          <p className={styles.vehicleSummary}>
            {vehicle.description ?? "Entre em contato para mais informações."}
          </p>
        </header>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Especificações</span>
          <h2 className={styles.subTitle}>Detalhes do veículo</h2>
        </div>

        <div className={styles.specsGrid}>
          {specifications.map(({ label, value, Icon }) => (
            <div key={label} className={styles.specBox}>
              <div className={styles.specIconWrap}>
                <Icon aria-hidden="true" />
              </div>
              <div>
                <span className={styles.specLabel}>{label}</span>
                <strong className={styles.specVal}>{value}</strong>
              </div>
            </div>
          ))}
          {vehicle.series && (
            <div className={styles.specBox}>
              <div className={styles.specIconWrap}>
                <AiOutlineCar aria-hidden="true" />
              </div>
              <div>
                <span className={styles.specLabel}>Versão</span>
                <strong className={styles.specVal}>{vehicle.series}</strong>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
