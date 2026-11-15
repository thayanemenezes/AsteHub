"use client";

import { useState } from "react";
import Link from "next/link";
import { AiOutlineArrowLeft, AiOutlineCar } from "react-icons/ai";
import { vehicles } from "./content";
import { VehicleCard } from "./components/vehicle-card";
import styles from "./vehicle-catalog-page.module.css";

const categories = [
  "Todos",
  "SUV Compacto",
  "Hatch Premium",
  "Sedan Médio",
  "SUV Médio",
  "SUV Urbano",
  "Utilitário / Picape",
];

export function VehicleCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredVehicles =
    selectedCategory === "Todos"
      ? vehicles
      : vehicles.filter((v) => v.category === selectedCategory);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <AiOutlineArrowLeft className={styles.backIcon} />
          Voltar para a página inicial
        </Link>
        <h1 className={styles.title}>Catálogo de Veículos</h1>
        <p className={styles.subtitle}>
          Conheça todos os modelos disponíveis para locação mensal com pacotes
          de proteção, manutenção e assistência inclusos.
        </p>

        <div
          className={styles.filters}
          role="tablist"
          aria-label="Filtrar por categoria"
        >
          {categories.map((cat) => {
            const active = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                className={`${styles.filterBtn} ${active ? styles.filterActive : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className={styles.cardCol}>
            <VehicleCard vehicle={vehicle} />
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className={styles.empty}>
          <AiOutlineCar className={styles.emptyIcon} />
          <p>Nenhum veículo encontrado para a categoria selecionada.</p>
        </div>
      )}

      <div className={styles.disclaimer}>
        <p>
          *Todos os valores informados são simulações ilustrativas com base em
          contratos demonstrativos. As características dos modelos podem variar
          conforme disponibilidade de estoque.
        </p>
      </div>
    </main>
  );
}
