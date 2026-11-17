import Link from "next/link";
import type {
  PublicCategory,
  PublicPage,
  PublicVehicle,
} from "./public-site-api";
import { PublicVehicleCard } from "./vehicle-card";
import styles from "./public-site.module.css";

export function VehicleCatalogPage({
  categories,
  categoryId,
  vehicles,
}: {
  categories: PublicCategory[];
  categoryId?: string;
  vehicles: PublicPage<PublicVehicle>;
}) {
  const categoryQuery = categoryId
    ? `?category=${encodeURIComponent(categoryId)}`
    : "";

  return (
    <main className={styles.page}>
      <header className={styles.pageHeading}>
        <h1>Catálogo de veículos</h1>
        <p>Consulte os veículos publicados pela locadora.</p>
        <Link className={styles.textLink} href="/">
          Voltar para a página inicial
        </Link>
      </header>

      <nav aria-label="Filtrar por categoria" className={styles.filters}>
        <Link
          aria-current={categoryId ? undefined : "page"}
          className={`${styles.filter} ${!categoryId ? styles.filterActive : ""}`}
          href="/veiculos"
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            aria-current={category.id === categoryId ? "page" : undefined}
            className={`${styles.filter} ${category.id === categoryId ? styles.filterActive : ""}`}
            href={`/veiculos?category=${encodeURIComponent(category.id)}`}
            key={category.id}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {vehicles.data.length > 0 ? (
        <div className={styles.vehicleGrid}>
          {vehicles.data.map((vehicle) => (
            <PublicVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className={styles.empty} role="status">
          <p>
            {categoryId
              ? "Nenhum veículo publicado foi encontrado para esta categoria."
              : "Nenhum veículo publicado no momento."}
          </p>
          {categoryId && (
            <Link className={styles.textLink} href="/veiculos">
              Ver todos os veículos
            </Link>
          )}
        </div>
      )}

      {vehicles.totalPages > 1 && (
        <nav aria-label="Paginação" className={styles.pagination}>
          {vehicles.page > 1 ? (
            <Link
              href={`/veiculos?page=${vehicles.page - 1}${categoryQuery.replace("?", "&")}`}
            >
              Página anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {vehicles.page} de {vehicles.totalPages}
          </span>
          {vehicles.page < vehicles.totalPages && (
            <Link
              href={`/veiculos?page=${vehicles.page + 1}${categoryQuery.replace("?", "&")}`}
            >
              Próxima página
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
