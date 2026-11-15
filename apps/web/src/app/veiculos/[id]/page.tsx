import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehicleById, vehicles } from "@/features/subscription/content";
import { VehicleDetailPage } from "@/features/subscription/vehicle-detail-page";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    return {
      title: "Veículo não encontrado | AsteHub",
    };
  }

  return {
    title: `${vehicle.brand} ${vehicle.model} por Assinatura | AsteHub`,
    description: vehicle.description,
  };
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailPage vehicle={vehicle} />;
}
