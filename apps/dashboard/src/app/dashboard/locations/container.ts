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
  digitsOnly,
  formErrors,
  type FormErrors,
  locationFormSchema,
} from "../../../validation/form-validation";
import {
  LocationApi,
  LocationApiError,
  type LocationInput,
  type LocationPage,
  type OrganizationLocation,
} from "../../../locations/location-api";

const PAGE_SIZE = 10;

export type LocationDialog =
  | { type: "create" }
  | { type: "edit"; location: OrganizationLocation }
  | { type: "delete"; location: OrganizationLocation }
  | { type: "bulk-delete" }
  | null;

export interface LocationFormValues {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  description: string;
  managerName: string;
}

const emptyForm: LocationFormValues = {
  name: "",
  address: "",
  city: "",
  state: "",
  phone: "",
  description: "",
  managerName: "",
};

function loadErrorMessage(error: unknown): string {
  if (error instanceof LocationApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar unidades desta organização.";
  }
  return "Não foi possível carregar as unidades.";
}

function mutationErrorMessage(error: unknown, action: "save" | "delete") {
  if (error instanceof LocationApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar unidades desta organização.";
  }
  return action === "save"
    ? "Não foi possível salvar a unidade. Verifique os dados e tente novamente."
    : "Não foi possível excluir as unidades. Atualize a lista e tente novamente.";
}

function optionalValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function useLocationsContainer() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  )?.id;
  const api = useMemo(() => new LocationApi(), []);
  const [page, setPage] = useState(1);
  const [locationDialog, setLocationDialog] = useState<LocationDialog>(null);
  const [form, setForm] = useState<LocationFormValues>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    FormErrors<LocationFormValues>
  >({});

  const loadLocations = useCallback(
    (signal: AbortSignal): Promise<LocationPage> => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.list(organizationId, page, PAGE_SIZE, signal);
    },
    [api, organizationId, page],
  );
  const resourceKey = organizationId ? `${organizationId}:${page}` : null;
  const resource = useAsyncResource(resourceKey, loadLocations);
  const locationPage = resource.data ?? null;
  const currentLocations = locationPage?.data ?? [];

  useEffect(() => {
    setSelectedIds([]);
  }, [organizationId, page]);

  const allVisibleSelected =
    currentLocations.length > 0 &&
    currentLocations.every((location) => selectedIds.includes(location.id));
  const someVisibleSelected = currentLocations.some((location) =>
    selectedIds.includes(location.id),
  );
  const pageCount = Math.max(1, locationPage?.totalPages ?? 1);
  const loadError = resource.error
    ? loadErrorMessage(resource.error)
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para carregar unidades."
      : "";

  function openCreateDialog() {
    setForm(emptyForm);
    setMutationError("");
    setFieldErrors({});
    setLocationDialog({ type: "create" });
  }

  function openEditDialog(location: OrganizationLocation) {
    setForm({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      phone: digitsOnly(location.phone ?? ""),
      description: location.description ?? "",
      managerName: location.managerName ?? "",
    });
    setMutationError("");
    setFieldErrors({});
    setLocationDialog({ type: "edit", location });
  }

  function openDeleteDialog(location: OrganizationLocation) {
    setMutationError("");
    setLocationDialog({ type: "delete", location });
  }

  function openBulkDeleteDialog() {
    setMutationError("");
    setLocationDialog({ type: "bulk-delete" });
  }

  function closeDialog() {
    setLocationDialog(null);
    setFieldErrors({});
  }

  function updateFormField(field: keyof LocationFormValues, value: string) {
    const nextValue = field === "phone" ? digitsOnly(value) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setPage((current) => current + 1);
  }

  async function submitLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !organizationId ||
      isSubmitting ||
      !locationDialog ||
      (locationDialog.type !== "create" && locationDialog.type !== "edit")
    ) {
      return;
    }

    const parsedForm = locationFormSchema.safeParse(form);
    if (!parsedForm.success) {
      setFieldErrors(formErrors<LocationFormValues>(parsedForm.error.issues));
      return;
    }

    const input: LocationInput = {
      name: parsedForm.data.name,
      address: parsedForm.data.address,
      city: parsedForm.data.city,
      state: parsedForm.data.state,
      phone: optionalValue(parsedForm.data.phone),
      description: optionalValue(parsedForm.data.description),
      managerName: optionalValue(parsedForm.data.managerName),
    };
    setIsSubmitting(true);
    setMutationError("");
    setFieldErrors({});
    try {
      if (locationDialog.type === "create") {
        await api.create(organizationId, input);
        toast.success("Unidade cadastrada com sucesso.");
        setPage(1);
      } else {
        await api.update(organizationId, locationDialog.location.id, input);
        toast.success("Unidade atualizada com sucesso.");
      }
      setLocationDialog(null);
      resource.retry();
    } catch (error) {
      const message = mutationErrorMessage(error, "save");
      setMutationError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!organizationId || !locationDialog || isSubmitting) return;
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (locationDialog.type === "delete") {
        await api.delete(organizationId, locationDialog.location.id);
        toast.success("Unidade excluída com sucesso.");
      } else if (locationDialog.type === "bulk-delete") {
        await api.deleteMany(organizationId, selectedIds);
        toast.success("Unidades selecionadas excluídas com sucesso.");
      } else {
        return;
      }
      setSelectedIds([]);
      setLocationDialog(null);
      resource.retry();
    } catch (error) {
      const message = mutationErrorMessage(error, "delete");
      setMutationError(message);
      toast.error(message);
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
          (id) => !currentLocations.some((location) => location.id === id),
        ),
      );
      return;
    }
    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...currentLocations.map((location) => location.id),
      ]),
    ]);
  }

  return {
    allVisibleSelected,
    closeDialog,
    confirmDelete,
    currentLocations,
    form,
    fieldErrors,
    goToNextPage,
    goToPreviousPage,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    loadError,
    locationDialog,
    locationPage,
    mutationError,
    openBulkDeleteDialog,
    openCreateDialog,
    openDeleteDialog,
    openEditDialog,
    organizationId,
    page,
    pageCount,
    retryLoading: resource.retry,
    selectedIds,
    someVisibleSelected,
    submitLocation,
    togglePageSelection,
    toggleSelection,
    updateFormField,
  };
}
