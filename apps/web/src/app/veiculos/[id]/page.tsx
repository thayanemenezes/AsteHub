import { VehicleDetailContainer } from "@/features/subscription/vehicle-detail-container";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { id } = await params;
  return <VehicleDetailContainer id={id} />;
}
