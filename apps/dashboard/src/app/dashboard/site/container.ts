"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../auth/auth-provider";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import {
  digitsOnly,
  formErrors,
  type FormErrors,
  siteFormSchema,
} from "../../../validation/form-validation";
import {
  SiteApi,
  SiteApiError,
  type OrganizationSite,
  type SiteInput,
} from "../../../sites/site-api";

export interface SiteFormValues {
  publicName: string;
  slug: string;
  domain: string;
  phone: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

const emptyForm: SiteFormValues = {
  publicName: "",
  slug: "",
  domain: "",
  phone: "",
  description: "",
  primaryColor: "",
  secondaryColor: "",
  logoUrl: "",
};

function optionalValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function loadErrorMessage(error: unknown): string {
  if (error instanceof SiteApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar o site desta organização.";
  }
  return "Não foi possível carregar a configuração do site.";
}

function mutationErrorMessage(error: unknown, action: "save" | "delete") {
  if (error instanceof SiteApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar o site desta organização.";
  }
  if (error instanceof SiteApiError && error.status === 409) {
    return "Este slug ou domínio já está sendo usado por outro site.";
  }
  return action === "save"
    ? "Não foi possível salvar a configuração. Verifique os dados e tente novamente."
    : "Não foi possível excluir a configuração do site. Tente novamente.";
}

function formValues(site: OrganizationSite | null): SiteFormValues {
  if (!site) {
    return emptyForm;
  }
  return {
    publicName: site.publicName,
    slug: site.slug,
    domain: site.domain ?? "",
    phone: site.phone ?? "",
    description: site.description ?? "",
    primaryColor: site.primaryColor ?? "",
    secondaryColor: site.secondaryColor ?? "",
    logoUrl: site.logoUrl ?? "",
  };
}

export function useSiteContainer() {
  const { user } = useAuth();
  const organizationId = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  )?.id;
  const api = useMemo(() => new SiteApi(), []);
  const [form, setForm] = useState<SiteFormValues>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors<SiteFormValues>>(
    {},
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadSite = useCallback(
    (signal: AbortSignal): Promise<OrganizationSite | null> => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.getByOrganization(organizationId, signal);
    },
    [api, organizationId],
  );
  const resource = useAsyncResource(organizationId ?? null, loadSite);
  const site = resource.data ?? null;
  const loadError = resource.error
    ? loadErrorMessage(resource.error)
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para configurar o site."
      : "";

  function startEditing() {
    setForm(formValues(site));
    setMutationError("");
    setFieldErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setMutationError("");
    setFieldErrors({});
  }

  function updateFormField(field: keyof SiteFormValues, value: string) {
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

  async function submitSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || isSubmitting) {
      return;
    }

    const parsedForm = siteFormSchema.safeParse(form);
    if (!parsedForm.success) {
      setFieldErrors(formErrors<SiteFormValues>(parsedForm.error.issues));
      return;
    }

    const input: SiteInput = {
      publicName: parsedForm.data.publicName,
      slug: parsedForm.data.slug,
      domain: optionalValue(parsedForm.data.domain)?.toLowerCase() ?? null,
      phone: optionalValue(parsedForm.data.phone),
      description: optionalValue(parsedForm.data.description),
      primaryColor: optionalValue(parsedForm.data.primaryColor),
      secondaryColor: optionalValue(parsedForm.data.secondaryColor),
      logoUrl: optionalValue(parsedForm.data.logoUrl),
    };
    setIsSubmitting(true);
    setMutationError("");
    setFieldErrors({});
    try {
      if (site) {
        await api.update(organizationId, site.id, input);
      } else {
        await api.create(organizationId, input);
      }
      toast.success("Configuração do site salva com sucesso.");
      setIsEditing(false);
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
    if (!organizationId || !site || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setMutationError("");
    try {
      await api.delete(organizationId, site.id);
      toast.success("Configuração do site excluída com sucesso.");
      setIsDeleteDialogOpen(false);
      resource.retry();
    } catch (error) {
      const message = mutationErrorMessage(error, "delete");
      setMutationError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    cancelEditing,
    confirmDelete,
    form,
    fieldErrors,
    isDeleteDialogOpen,
    isEditing,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    loadError,
    mutationError,
    organizationId,
    retryLoading: resource.retry,
    setIsDeleteDialogOpen,
    site,
    startEditing,
    submitSite,
    updateFormField,
  };
}
