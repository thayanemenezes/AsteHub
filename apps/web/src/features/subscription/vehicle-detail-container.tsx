import { notFound } from "next/navigation";
import { PublicDataError } from "./public-data-error";
import {
  getPublicVehicle,
  PublicSiteApiError,
  resolvePublicTenant,
} from "./public-site-api";
import { VehicleDetailPage } from "./vehicle-detail-page";

export async function VehicleDetailContainer({ id }: { id: string }) {
  const tenant = await resolvePublicTenant();
  try {
    const vehicle = await getPublicVehicle(tenant, id);
    return <VehicleDetailPage vehicle={vehicle} />;
  } catch (error) {
    if (error instanceof PublicSiteApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof PublicSiteApiError) {
      return <PublicDataError href={`/veiculos/${encodeURIComponent(id)}`} />;
    }
    throw error;
  }
}
