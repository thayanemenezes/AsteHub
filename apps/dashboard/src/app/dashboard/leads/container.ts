"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "react-toastify";
import type { LeadStatus } from "@repo/contracts";
import { useAuth } from "../../../auth/auth-provider";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import { LocationApi, type OrganizationLocation } from "../../../locations/location-api";
import { VehicleApi, type Vehicle } from "../../../vehicles/vehicle-api";
import {
  digitsOnly,
  formErrors,
  type FormErrors,
  leadFormSchema,
} from "../../../validation/form-validation";
import {
  LeadApi,
  LeadApiError,
  type CreateLeadInput,
  type Lead,
  type LeadPage,
  type UpdateLeadInput,
} from "../../../leads/lead-api";

const PAGE_SIZE = 10;

export type LeadDialog =
  | { type: "create" }
  | { type: "edit"; lead: Lead }
  | { type: "delete"; lead: Lead }
  | { type: "bulk-delete" }
  | null;

export interface LeadFormValues {
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  vehicleId: string;
  locationId: string;
}

const emptyForm: LeadFormValues = {
  contactName: "",
  email: "",
  phone: "",
  message: "",
  status: "NEW",
  vehicleId: "",
  locationId: "",
};

interface LeadResources {
  page: LeadPage;
  vehicles: Vehicle[];
  locations: OrganizationLocation[];
}

function loadErrorMessage(error: unknown): string {
  if (error instanceof LeadApiError && error.status === 403) {
    return "Você não tem permissão para acessar leads desta organização.";
  }
  return "Não foi possível carregar os leads.";
}

function mutationErrorMessage(error: unknown, action: "save" | "delete") {
  if (error instanceof LeadApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar leads desta organização.";
  }
  return action === "save"
    ? "Não foi possível salvar o lead. Verifique os dados e tente novamente."
    : "Não foi possível excluir os leads. Atualize a lista e tente novamente.";
}

function optionalValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function useLeadsContainer() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  )?.id;
  const api = useMemo(() => new LeadApi(), []);
  const vehicleApi = useMemo(() => new VehicleApi(), []);
  const locationApi = useMemo(() => new LocationApi(), []);
  const [page, setPage] = useState(1);
  const [leadDialog, setLeadDialog] = useState<LeadDialog>(null);
  const [form, setForm] = useState<LeadFormValues>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors<LeadFormValues>>({});

  const loadLeads = useCallback(
    async (signal: AbortSignal): Promise<LeadResources> => {
      if (!organizationId) {
        throw new Error("An active organization is required.");
      }
      const [leadPage, vehiclePage, locationPage] = await Promise.all([
        api.list(organizationId, page, PAGE_SIZE, signal),
        vehicleApi.list(organizationId, 1, 100, signal),
        locationApi.list(organizationId, 1, 100, signal),
      ]);
      return {
        page: leadPage,
        vehicles: vehiclePage.data,
        locations: locationPage.data,
      };
    },
    [api, locationApi, organizationId, page, vehicleApi],
  );
  const resourceKey = organizationId ? `${organizationId}:${page}` : null;
  const resource = useAsyncResource(resourceKey, loadLeads);
  const leadResources = resource.data;
  const leadPage = leadResources?.page ?? null;
  const currentLeads = leadPage?.data ?? [];
  const vehicles = leadResources?.vehicles ?? [];
  const locations = leadResources?.locations ?? [];

  useEffect(() => {
    setSelectedIds([]);
  }, [organizationId, page]);

  const allVisibleSelected =
    currentLeads.length > 0 &&
    currentLeads.every((lead) => selectedIds.includes(lead.id));
  const someVisibleSelected = currentLeads.some((lead) =>
    selectedIds.includes(lead.id),
  );
  const pageCount = Math.max(1, leadPage?.totalPages ?? 1);
  const loadError = resource.error
    ? loadErrorMessage(resource.error)
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para carregar leads."
      : "";

  function openCreateDialog() {
    setForm(emptyForm);
    setMutationError("");
    setFieldErrors({});
    setLeadDialog({ type: "create" });
  }

  function openEditDialog(lead: Lead) {
    setForm({
      contactName: lead.contactName,
      email: lead.email ?? "",
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      vehicleId: lead.vehicleId ?? "",
      locationId: lead.locationId ?? "",
    });
    setMutationError("");
    setFieldErrors({});
    setLeadDialog({ type: "edit", lead });
  }

  function openDeleteDialog(lead: Lead) {
    setMutationError("");
    setLeadDialog({ type: "delete", lead });
  }

  function openBulkDeleteDialog() {
    setMutationError("");
    setLeadDialog({ type: "bulk-delete" });
  }

  function closeDialog() {
    setLeadDialog(null);
    setFieldErrors({});
  }

  function updateFormField(field: keyof LeadFormValues, value: string) {
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

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !organizationId ||
      isSubmitting ||
      !leadDialog ||
      (leadDialog.type !== "create" && leadDialog.type !== "edit")
    ) {
      return;
    }

    const parsedForm = leadFormSchema.safeParse(form);
    if (!parsedForm.success) {
      setFieldErrors(formErrors<LeadFormValues>(parsedForm.error.issues));
      return;
    }

    const values = parsedForm.data;
    const commonInput = {
      contactName: values.contactName,
      email: optionalValue(values.email),
      phone: values.phone,
      message: values.message,
      vehicleId: optionalValue(values.vehicleId),
      locationId: optionalValue(values.locationId),
    };
    setIsSubmitting(true);
    setMutationError("");
    setFieldErrors({});
    try {
      if (leadDialog.type === "create") {
        const input: CreateLeadInput = commonInput;
        await api.create(organizationId, input);
        toast.success("Lead cadastrado com sucesso.");
        setPage(1);
      } else {
        const input: UpdateLeadInput = {
          ...commonInput,
          email: commonInput.email ?? null,
          vehicleId: commonInput.vehicleId ?? null,
          locationId: commonInput.locationId ?? null,
          status: values.status,
        };
        await api.update(organizationId, leadDialog.lead.id, input);
        toast.success("Lead atualizado com sucesso.");
      }
      setLeadDialog(null);
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
    if (!organizationId || !leadDialog || isSubmitting) return;
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (leadDialog.type === "delete") {
        await api.delete(organizationId, leadDialog.lead.id);
        toast.success("Lead excluído com sucesso.");
      } else if (leadDialog.type === "bulk-delete") {
        await api.deleteMany(organizationId, selectedIds);
        toast.success("Leads selecionados excluídos com sucesso.");
      } else {
        return;
      }
      setSelectedIds([]);
      setLeadDialog(null);
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
        current.filter((id) => !currentLeads.some((lead) => lead.id === id)),
      );
      return;
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...currentLeads.map((lead) => lead.id)]),
    ]);
  }

  return {
    allVisibleSelected,
    closeDialog,
    confirmDelete,
    currentLeads,
    fieldErrors,
    form,
    goToNextPage,
    goToPreviousPage,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    leadDialog,
    leadPage,
    loadError,
    locations,
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
    submitLead,
    togglePageSelection,
    toggleSelection,
    updateFormField,
    vehicles,
  };
}
