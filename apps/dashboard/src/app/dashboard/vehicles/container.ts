"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../auth/auth-provider";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import {
  VehicleApi,
  VehicleApiError,
  type Vehicle,
  type VehicleInput,
  type VehiclePage,
} from "../../../vehicles/vehicle-api";

const PAGE_SIZE = 10;

export type VehicleDialog =
  | { type: "create" }
  | { type: "edit"; vehicle: Vehicle }
  | { type: "delete"; vehicle: Vehicle }
  | { type: "bulk-delete" }
  | null;

export interface VehicleFormValues {
  make: string;
  model: string;
  year: string;
  description: string;
}

const emptyForm: VehicleFormValues = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  description: "",
};

function vehicleErrorMessage(error: unknown): string {
  if (error instanceof VehicleApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar veículos desta organização.";
  }
  return "Não foi possível carregar os veículos.";
}

export function useVehiclesContainer() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  )?.id;
  const api = useMemo(() => new VehicleApi(), []);
  const [page, setPage] = useState(1);
  const [vehicleDialog, setVehicleDialog] = useState<VehicleDialog>(null);
  const [form, setForm] = useState<VehicleFormValues>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");

  const loadVehicles = useCallback(
    (signal: AbortSignal): Promise<VehiclePage> => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.list(organizationId, page, PAGE_SIZE, signal);
    },
    [api, organizationId, page],
  );
  const resourceKey = organizationId ? `${organizationId}:${page}` : null;
  const resource = useAsyncResource(resourceKey, loadVehicles);
  const vehiclePage = resource.data ?? null;
  const currentVehicles = vehiclePage?.data ?? [];

  useEffect(() => {
    setSelectedIds([]);
  }, [organizationId, page]);

  const allVisibleSelected =
    currentVehicles.length > 0 &&
    currentVehicles.every((vehicle) => selectedIds.includes(vehicle.id));
  const someVisibleSelected = currentVehicles.some((vehicle) =>
    selectedIds.includes(vehicle.id),
  );
  const pageCount = Math.max(1, vehiclePage?.totalPages ?? 1);
  const loadError = resource.error
    ? vehicleErrorMessage(resource.error)
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para carregar veículos."
      : "";

  function openCreateDialog() {
    setForm(emptyForm);
    setMutationError("");
    setVehicleDialog({ type: "create" });
  }

  function openEditDialog(vehicle: Vehicle) {
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: String(vehicle.year),
      description: vehicle.description ?? "",
    });
    setMutationError("");
    setVehicleDialog({ type: "edit", vehicle });
  }

  function openDeleteDialog(vehicle: Vehicle) {
    setMutationError("");
    setVehicleDialog({ type: "delete", vehicle });
  }

  function openBulkDeleteDialog() {
    setMutationError("");
    setVehicleDialog({ type: "bulk-delete" });
  }

  function closeDialog() {
    setVehicleDialog(null);
  }

  function updateFormField(field: keyof VehicleFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setPage((current) => current + 1);
  }

  async function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !organizationId ||
      isSubmitting ||
      !vehicleDialog ||
      (vehicleDialog.type !== "create" && vehicleDialog.type !== "edit")
    ) {
      return;
    }

    const input: VehicleInput = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      description: form.description.trim(),
    };
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (vehicleDialog.type === "create") {
        await api.create(organizationId, input);
        toast.success("Veículo cadastrado com sucesso.");
        setPage(1);
      } else {
        await api.update(organizationId, vehicleDialog.vehicle.id, input);
        toast.success("Veículo atualizado com sucesso.");
      }
      setVehicleDialog(null);
      resource.retry();
    } catch (error) {
      setMutationError(
        error instanceof VehicleApiError && error.status === 403
          ? vehicleErrorMessage(error)
          : "Não foi possível salvar o veículo. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!organizationId || !vehicleDialog || isSubmitting) return;
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (vehicleDialog.type === "delete") {
        await api.delete(organizationId, vehicleDialog.vehicle.id);
        toast.success("Veículo excluído com sucesso.");
      } else if (vehicleDialog.type === "bulk-delete") {
        await api.deleteMany(organizationId, selectedIds);
        toast.success("Veículos selecionados excluídos com sucesso.");
      } else {
        return;
      }
      setSelectedIds([]);
      setVehicleDialog(null);
      resource.retry();
    } catch (error) {
      setMutationError(
        error instanceof VehicleApiError && error.status === 403
          ? vehicleErrorMessage(error)
          : "Não foi possível excluir os veículos. Atualize a lista e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function togglePageSelection() {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !currentVehicles.some((vehicle) => vehicle.id === id),
        ),
      );
      return;
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...currentVehicles.map((vehicle) => vehicle.id)]),
    ]);
  }

  return {
    allVisibleSelected,
    confirmDelete,
    currentVehicles,
    closeDialog,
    form,
    goToNextPage,
    goToPreviousPage,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    loadError,
    mutationError,
    openCreateDialog,
    openBulkDeleteDialog,
    openDeleteDialog,
    openEditDialog,
    organizationId,
    page,
    pageCount,
    retryLoading: resource.retry,
    selectedIds,
    someVisibleSelected,
    submitVehicle,
    togglePageSelection,
    toggleSelection,
    updateFormField,
    vehicleDialog,
    vehiclePage,
  };
}
