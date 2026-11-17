import { notFound } from "next/navigation";
import { PublicDataError } from "./public-data-error";
import {
  getPublicCategories,
  getPublicVehicles,
  PublicSiteApiError,
  resolvePublicTenant,
} from "./public-site-api";
import { VehicleCatalogPage } from "./vehicle-catalog-page";

interface SearchParams {
  category?: string;
  page?: string;
}

function positivePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export async function VehicleCatalogContainer({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const tenant = await resolvePublicTenant();
  const params = await searchParams;
  const categoryId = params.category || undefined;
  try {
    const [vehicles, categories] = await Promise.all([
      getPublicVehicles(tenant, positivePage(params.page), 12, categoryId),
      getPublicCategories(tenant),
    ]);
    return (
      <VehicleCatalogPage
        categories={categories}
        categoryId={categoryId}
        vehicles={vehicles}
      />
    );
  } catch (error) {
    if (error instanceof PublicSiteApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof PublicSiteApiError) {
      return <PublicDataError href="/veiculos" />;
    }
    throw error;
  }
}
