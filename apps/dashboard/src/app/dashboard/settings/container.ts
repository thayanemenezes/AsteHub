"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../auth/auth-provider";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import {
  formErrors,
  type FormErrors,
  siteSettingsFormSchema,
  userSettingsFormSchema,
} from "../../../validation/form-validation";
import {
  SiteApi,
  SiteApiError,
  type OrganizationSite,
  type SiteInput,
} from "../../../sites/site-api";
import {
  UserApi,
  UserApiError,
  type DashboardLanguage,
} from "../../../users/user-api";

export interface SiteSettingsValues {
  publicName: string;
  slug: string;
  domain: string;
  phone: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
}

export interface SettingsFormValues extends SiteSettingsValues {
  language: DashboardLanguage;
}

interface SettingsData {
  site: OrganizationSite | null;
  language: DashboardLanguage;
}

const emptySiteValues: SiteSettingsValues = {
  publicName: "",
  slug: "",
  domain: "",
  phone: "",
  description: "",
  primaryColor: "",
  secondaryColor: "",
  logoUrl: "",
  seoTitle: "",
  seoDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
};

function organizationSlug(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/g, "");
  return slug.length >= 3 ? slug : "minha-locadora";
}

function emptyForm(organizationName: string): SettingsFormValues {
  return {
    ...emptySiteValues,
    publicName: organizationName,
    slug: organizationSlug(organizationName),
    language: "pt-BR",
  };
}

function siteFormValues(
  site: OrganizationSite | null,
  organizationName: string,
  language: DashboardLanguage,
): SettingsFormValues {
  if (!site) {
    return { ...emptyForm(organizationName), language };
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
    seoTitle: site.seoTitle ?? "",
    seoDescription: site.seoDescription ?? "",
    ogTitle: site.ogTitle ?? "",
    ogDescription: site.ogDescription ?? "",
    ogImageUrl: site.ogImageUrl ?? "",
    language,
  };
}

function optionalValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isDashboardLanguage(value: string): value is DashboardLanguage {
  return value === "pt-BR" || value === "en";
}

function loadErrorMessage(error: unknown): string {
  if (
    (error instanceof SiteApiError || error instanceof UserApiError) &&
    error.status === 403
  ) {
    return "Você não tem permissão para carregar estas configurações.";
  }
  return "Não foi possível carregar as configurações. Tente novamente.";
}

function saveErrorMessage(error: unknown, section: "site" | "language") {
  if (
    (error instanceof SiteApiError || error instanceof UserApiError) &&
    error.status === 403
  ) {
    return "Você não tem permissão para alterar esta configuração.";
  }
  if (section === "site" && error instanceof SiteApiError && error.status === 409) {
    return "Este identificador ou domínio já está sendo usado por outro site.";
  }
  return "Não foi possível salvar. Verifique os dados e tente novamente.";
}

export function useSettingsContainer() {
  const { status, user } = useAuth();
  const organization = user?.organizations?.find(
    (membership) => membership.status === "ACTIVE",
  );
  const organizationId = organization?.id;
  const organizationName = organization?.name ?? "";
  const siteApi = useMemo(() => new SiteApi(), []);
  const userApi = useMemo(() => new UserApi(), []);
  const [form, setForm] = useState<SettingsFormValues>(() =>
    emptyForm(organizationName),
  );
  const [fieldErrors, setFieldErrors] = useState<
    FormErrors<SiteSettingsValues>
  >({});
  const [languageError, setLanguageError] = useState("");
  const [siteError, setSiteError] = useState("");
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [isSavingSite, setIsSavingSite] = useState(false);

  const load = useCallback(
    async (signal: AbortSignal): Promise<SettingsData> => {
      const [settings, site] = await Promise.all([
        userApi.getSettings(signal),
        organizationId
          ? siteApi.getByOrganization(organizationId, signal)
          : Promise.resolve(null),
      ]);
      return { language: settings.language, site };
    },
    [organizationId, siteApi, userApi],
  );
  const resource = useAsyncResource(user?.id ?? null, load);

  useEffect(() => {
    if (resource.data) {
      setForm(
        siteFormValues(
          resource.data.site,
          organizationName,
          resource.data.language,
        ),
      );
    }
  }, [organizationName, resource.data]);

  function updateSiteField(field: keyof SiteSettingsValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateLanguage(value: string) {
    if (isDashboardLanguage(value)) {
      setForm((current) => ({ ...current, language: value }));
    }
    setLanguageError("");
  }

  async function saveLanguage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSavingLanguage) {
      return;
    }
    const parsed = userSettingsFormSchema.safeParse({
      language: form.language,
    });
    if (!parsed.success) {
      setLanguageError("Selecione um idioma válido.");
      return;
    }

    setIsSavingLanguage(true);
    setLanguageError("");
    try {
      const saved = await userApi.updateSettings(parsed.data.language);
      setForm((current) => ({ ...current, language: saved.language }));
      toast.success("Idioma preferido salvo com sucesso.");
    } catch (error) {
      const message = saveErrorMessage(error, "language");
      setLanguageError(message);
      toast.error(message);
    } finally {
      setIsSavingLanguage(false);
    }
  }

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || isSavingSite) {
      return;
    }
    const parsed = siteSettingsFormSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(formErrors<SiteSettingsValues>(parsed.error.issues));
      return;
    }

    const input: SiteInput = {
      publicName: parsed.data.publicName,
      slug: parsed.data.slug,
      domain: optionalValue(parsed.data.domain)?.toLowerCase() ?? null,
      phone: optionalValue(parsed.data.phone),
      description: optionalValue(parsed.data.description),
      primaryColor: optionalValue(parsed.data.primaryColor),
      secondaryColor: optionalValue(parsed.data.secondaryColor),
      logoUrl: optionalValue(parsed.data.logoUrl),
      seoTitle: optionalValue(parsed.data.seoTitle),
      seoDescription: optionalValue(parsed.data.seoDescription),
      ogTitle: optionalValue(parsed.data.ogTitle),
      ogDescription: optionalValue(parsed.data.ogDescription),
      ogImageUrl: optionalValue(parsed.data.ogImageUrl),
    };

    setIsSavingSite(true);
    setSiteError("");
    setFieldErrors({});
    try {
      if (resource.data?.site) {
        await siteApi.update(organizationId, resource.data.site.id, input);
      } else {
        await siteApi.create(organizationId, input);
      }
      toast.success("Configurações do site salvas com sucesso.");
      resource.retry();
    } catch (error) {
      const message = saveErrorMessage(error, "site");
      setSiteError(message);
      toast.error(message);
    } finally {
      setIsSavingSite(false);
    }
  }

  return {
    fieldErrors,
    form,
    isLoading: status === "loading" || resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSavingLanguage,
    isSavingSite,
    hasSettings: resource.data !== undefined,
    languageError,
    loadError: resource.error ? loadErrorMessage(resource.error) : "",
    organizationId,
    retryLoading: resource.retry,
    saveLanguage,
    saveSite,
    siteError,
    updateLanguage,
    updateSiteField,
  };
}
