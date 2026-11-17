import { VehicleCatalogContainer } from "@/features/subscription/vehicle-catalog-container";

interface VehiclesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default function VehiclesPage({ searchParams }: VehiclesPageProps) {
  return <VehicleCatalogContainer searchParams={searchParams} />;
}
