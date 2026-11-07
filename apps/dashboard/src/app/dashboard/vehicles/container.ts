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
import { useDebouncedValue } from "../../../hooks/use-debounced-value";
import { VehicleCategoryApi } from "../../../vehicle-categories/vehicle-category-api";
import {
  digitsOnly,
  formErrors,
  type FormErrors,
  vehicleFormSchema,
} from "../../../validation/form-validation";
import {
  VehicleApi,
  VehicleApiError,
  type Vehicle,
  type VehicleInput,
  type VehiclePage,
} from "../../../vehicles/vehicle-api";

const PAGE_SIZE = 10;
const MAX_VEHICLE_IMAGES = 20;
const MAX_VEHICLE_IMAGE_SIZE = 10 * 1024 * 1024;
const VEHICLE_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

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
  series: string;
  isElectric: boolean;
  images: string;
  customFields: { name: string; value: string }[];
  categoryId: string;
}

const emptyForm: VehicleFormValues = {
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  description: "",
  series: "",
  isElectric: false,
  images: "",
  customFields: [],
  categoryId: "",
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
  const categoryApi = useMemo(() => new VehicleCategoryApi(), []);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [vehicleDialog, setVehicleDialog] = useState<VehicleDialog>(null);
  const [form, setForm] = useState<VehicleFormValues>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUploadError, setImageUploadError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors<VehicleFormValues>>(
    {},
  );

  const loadVehicles = useCallback(
    (signal: AbortSignal): Promise<VehiclePage> => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.list(
        organizationId,
        page,
        PAGE_SIZE,
        signal,
        debouncedSearchQuery,
      );
    },
    [api, debouncedSearchQuery, organizationId, page],
  );
  const resourceKey = organizationId
    ? `${organizationId}:${page}:${debouncedSearchQuery}`
    : null;
  const resource = useAsyncResource(resourceKey, loadVehicles);
  const vehiclePage = resource.data ?? null;
  const currentVehicles = vehiclePage?.data ?? [];
  const loadCategories = useCallback(
    (signal: AbortSignal) => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return categoryApi.listAll(organizationId, signal);
    },
    [categoryApi, organizationId],
  );
  const categoryResource = useAsyncResource(
    organizationId ? `vehicle-categories:${organizationId}` : null,
    loadCategories,
  );
  const vehicleCategories = categoryResource.data ?? [];
  const categoryLoadError = categoryResource.error
    ? "Não foi possível carregar as categorias. Tente novamente."
    : "";

  useEffect(() => {
    setSelectedIds([]);
  }, [debouncedSearchQuery, organizationId, page]);

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
    setImageFiles([]);
    setImageUploadError("");
    setMutationError("");
    setFieldErrors({});
    setVehicleDialog({ type: "create" });
  }

  function openEditDialog(vehicle: Vehicle) {
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: String(vehicle.year),
      description: vehicle.description ?? "",
      series: vehicle.series ?? "",
      isElectric: vehicle.isElectric,
      images: vehicle.images.join("\n"),
      customFields: vehicle.customFields.map((field) => ({ ...field })),
      categoryId: vehicle.categoryId ?? "",
    });
    setImageFiles([]);
    setImageUploadError("");
    setMutationError("");
    setFieldErrors({});
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
    setImageFiles([]);
    setImageUploadError("");
    setFieldErrors({});
  }

  function updateFormField(
    field:
      | "make"
      | "model"
      | "year"
      | "description"
      | "series"
      | "images"
      | "categoryId",
    value: string,
  ) {
    const nextValue = field === "year" ? digitsOnly(value) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    if (field === "images") setImageUploadError("");
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateElectric(value: boolean) {
    setForm((current) => ({ ...current, isElectric: value }));
  }

  function selectImageFiles(files: FileList | null) {
    const selected = Array.from(files ?? []);
    if (selected.length === 0) return;

    const currentUrlCount = form.images
      .split(/\r?\n/)
      .filter((url) => url.trim()).length;
    if (
      currentUrlCount + imageFiles.length + selected.length >
      MAX_VEHICLE_IMAGES
    ) {
      setImageUploadError(
        "Você pode adicionar no máximo 20 imagens por veículo.",
      );
      return;
    }
    const unsupported = selected.find(
      (file) => !VEHICLE_IMAGE_CONTENT_TYPES.has(file.type),
    );
    if (unsupported) {
      setImageUploadError(
        "Use arquivos JPEG, PNG, WebP ou AVIF. SVG não é aceito.",
      );
      return;
    }
    const oversized = selected.find(
      (file) => file.size === 0 || file.size > MAX_VEHICLE_IMAGE_SIZE,
    );
    if (oversized) {
      setImageUploadError("Cada imagem deve ter até 10 MB.");
      return;
    }

    setImageFiles((current) => [...current, ...selected]);
    setImageUploadError("");
  }

  function removeImageFile(index: number) {
    setImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  function addCustomField() {
    setForm((current) => ({
      ...current,
      customFields: [...current.customFields, { name: "", value: "" }],
    }));
  }

  function updateCustomField(
    index: number,
    field: "name" | "value",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      customFields: current.customFields.map((customField, currentIndex) =>
        currentIndex === index
          ? { ...customField, [field]: value }
          : customField,
      ),
    }));
    setFieldErrors((current) => {
      if (!current.customFields) return current;
      const next = { ...current };
      delete next.customFields;
      return next;
    });
  }

  function removeCustomField(index: number) {
    setForm((current) => ({
      ...current,
      customFields: current.customFields.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    setPage((current) => current + 1);
  }

  function updateSearchQuery(value: string) {
    setSearchQuery(value);
    setPage(1);
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

    const parsedForm = vehicleFormSchema.safeParse(form);
    if (!parsedForm.success) {
      setFieldErrors(formErrors<VehicleFormValues>(parsedForm.error.issues));
      return;
    }
    if (imageUploadError) return;
    if (
      parsedForm.data.images.length + imageFiles.length >
      MAX_VEHICLE_IMAGES
    ) {
      setFieldErrors({
        images: "Você pode adicionar no máximo 20 imagens por veículo.",
      });
      return;
    }

    const input: VehicleInput = {
      make: parsedForm.data.make,
      model: parsedForm.data.model,
      year: Number(parsedForm.data.year),
      description: parsedForm.data.description,
      series: parsedForm.data.series || null,
      isElectric: parsedForm.data.isElectric,
      images: [...parsedForm.data.images],
      customFields: parsedForm.data.customFields,
      categoryId: parsedForm.data.categoryId || null,
    };
    setIsSubmitting(true);
    setMutationError("");
    setFieldErrors({});
    try {
      for (let index = 0; index < imageFiles.length; index += 1) {
        try {
          const imageUrl = await api.uploadImage(
            organizationId,
            imageFiles[index]!,
          );
          input.images?.push(imageUrl);
          setForm((current) => ({
            ...current,
            images: [
              ...current.images.split(/\r?\n/).filter(Boolean),
              imageUrl,
            ].join("\n"),
          }));
        } catch {
          setImageFiles(imageFiles.slice(index));
          setMutationError(
            "Não foi possível enviar uma das imagens. Verifique a conexão e tente novamente.",
          );
          return;
        }
      }
      setImageFiles([]);
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
    fieldErrors,
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
    retryCategories: categoryResource.retry,
    categoryLoadError,
    isLoadingCategories: categoryResource.isLoading,
    vehicleCategories,
    searchQuery,
    updateSearchQuery,
    selectedIds,
    someVisibleSelected,
    submitVehicle,
    togglePageSelection,
    toggleSelection,
    removeImageFile,
    selectImageFiles,
    addCustomField,
    removeCustomField,
    imageFiles,
    imageUploadError,
    updateCustomField,
    updateElectric,
    updateFormField,
    vehicleDialog,
    vehiclePage,
  };
}
