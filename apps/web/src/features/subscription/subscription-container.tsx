import { notFound } from "next/navigation";
import { PublicDataError } from "./public-data-error";
import {
  getPublicVehicles,
  PublicSiteApiError,
  resolvePublicTenant,
} from "./public-site-api";
import { SubscriptionPage } from "./subscription-page";

export async function SubscriptionContainer() {
  const tenant = await resolvePublicTenant();
  try {
    const vehicles = await getPublicVehicles(tenant, 1, 6);
    return <SubscriptionPage vehicles={vehicles.data} />;
  } catch (error) {
    if (error instanceof PublicSiteApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof PublicSiteApiError) {
      return <PublicDataError href="/" />;
    }
    throw error;
  }
}
