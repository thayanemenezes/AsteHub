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
  VehicleCategoryApi,
  VehicleCategoryApiError,
  type VehicleCategory,
  type VehicleCategoryInput,
  type VehicleCategoryPage,
} from "../../../vehicle-categories/vehicle-category-api";

const PAGE_SIZE = 10;

export type VehicleCategoryDialog =
  | { type: "create" }
  | { type: "edit"; category: VehicleCategory }
  | { type: "delete"; category: VehicleCategory }
  | { type: "bulk-delete" }
  | null;

export interface VehicleCategoryFormValues {
  name: string;
  description: string;
}

const emptyForm: VehicleCategoryFormValues = { name: "", description: "" };

function vehicleCategoryErrorMessage(error: unknown): string {
  if (error instanceof VehicleCategoryApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar categorias desta organização.";
  }
  return "Não foi possível carregar as categorias.";
}

function mutationErrorMessage(error: unknown, action: "save" | "delete") {
  if (error instanceof VehicleCategoryApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar categorias desta organização.";
  }
  if (error instanceof VehicleCategoryApiError && error.status === 409) {
    return "Já existe uma categoria com esse nome nesta organização.";
  }
  return action === "save"
    ? "Não foi possível salvar a categoria. Verifique os dados e tente novamente."
    : "Não foi possível excluir as categorias. Atualize a lista e tente novamente.";
}

export function useVehicleCategoriesContainer() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  )?.id;
  const api = useMemo(() => new VehicleCategoryApi(), []);
  const [page, setPage] = useState(1);
  const [categoryDialog, setCategoryDialog] =
    useState<VehicleCategoryDialog>(null);
  const [form, setForm] = useState<VehicleCategoryFormValues>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");

  const loadCategories = useCallback(
    (signal: AbortSignal): Promise<VehicleCategoryPage> => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.list(organizationId, page, PAGE_SIZE, signal);
    },
    [api, organizationId, page],
  );
  const resourceKey = organizationId ? `${organizationId}:${page}` : null;
  const resource = useAsyncResource(resourceKey, loadCategories);
  const categoryPage = resource.data ?? null;
  const currentCategories = categoryPage?.data ?? [];

  useEffect(() => {
    setSelectedIds([]);
  }, [organizationId, page]);

  const allVisibleSelected =
    currentCategories.length > 0 &&
    currentCategories.every((category) => selectedIds.includes(category.id));
  const someVisibleSelected = currentCategories.some((category) =>
    selectedIds.includes(category.id),
  );
  const pageCount = Math.max(1, categoryPage?.totalPages ?? 1);
  const loadError = resource.error
    ? vehicleCategoryErrorMessage(resource.error)
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para carregar categorias."
      : "";

  function openCreateDialog() {
    setForm(emptyForm);
    setMutationError("");
    setCategoryDialog({ type: "create" });
  }

  function openEditDialog(category: VehicleCategory) {
    setForm({
      name: category.name,
      description: category.description ?? "",
    });
    setMutationError("");
    setCategoryDialog({ type: "edit", category });
  }

  function openDeleteDialog(category: VehicleCategory) {
    setMutationError("");
    setCategoryDialog({ type: "delete", category });
  }

  function openBulkDeleteDialog() {
    setMutationError("");
    setCategoryDialog({ type: "bulk-delete" });
  }

  function closeDialog() {
    setCategoryDialog(null);
  }

  function updateFormField(
    field: keyof VehicleCategoryFormValues,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setPage((current) => current + 1);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !organizationId ||
      isSubmitting ||
      !categoryDialog ||
      (categoryDialog.type !== "create" && categoryDialog.type !== "edit")
    ) {
      return;
    }

    const input: VehicleCategoryInput = {
      name: form.name.trim(),
      description: form.description.trim(),
    };
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (categoryDialog.type === "create") {
        await api.create(organizationId, input);
        toast.success("Categoria cadastrada com sucesso.");
        setPage(1);
      } else {
        await api.update(organizationId, categoryDialog.category.id, input);
        toast.success("Categoria atualizada com sucesso.");
      }
      setCategoryDialog(null);
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
    if (!organizationId || !categoryDialog || isSubmitting) return;
    setIsSubmitting(true);
    setMutationError("");
    try {
      if (categoryDialog.type === "delete") {
        await api.delete(organizationId, categoryDialog.category.id);
        toast.success("Categoria excluída com sucesso.");
      } else if (categoryDialog.type === "bulk-delete") {
        await api.deleteMany(organizationId, selectedIds);
        toast.success("Categorias selecionadas excluídas com sucesso.");
      } else {
        return;
      }
      setSelectedIds([]);
      setCategoryDialog(null);
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
          (id) => !currentCategories.some((category) => category.id === id),
        ),
      );
      return;
    }
    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...currentCategories.map((category) => category.id),
      ]),
    ]);
  }

  return {
    allVisibleSelected,
    categoryDialog,
    categoryPage,
    closeDialog,
    confirmDelete,
    currentCategories,
    form,
    goToNextPage,
    goToPreviousPage,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    loadError,
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
    submitCategory,
    togglePageSelection,
    toggleSelection,
    updateFormField,
  };
}
