"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../../auth/auth-provider";
import { FieldError } from "../../../components/forms/field-error";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import {
  formErrors,
  type FormErrors,
  userProfileFormSchema,
} from "../../../validation/form-validation";
import {
  UserApi,
  UserApiError,
  type UserProfile,
} from "../../../users/user-api";
import styles from "./profile.module.css";

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
}

function profileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
  };
}

function roleLabel(role: string): string {
  switch (role) {
    case "OWNER":
      return "Proprietário";
    case "ADMIN":
      return "Administrador";
    default:
      return "Membro";
  }
}

export default function ProfileContainer() {
  const { status: authStatus, updateProfile, user } = useAuth();
  const userApi = useMemo(() => new UserApi(), []);
  const load = useCallback(
    (signal: AbortSignal) => userApi.getProfile(signal),
    [userApi],
  );
  const resource = useAsyncResource(user?.id ?? null, load);
  const [form, setForm] = useState<ProfileFormValues>({
    name: "",
    email: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    FormErrors<ProfileFormValues>
  >({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resource.data) {
      setForm(profileFormValues(resource.data));
    }
  }, [resource.data]);

  function updateField(field: keyof ProfileFormValues, value: string) {
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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const parsed = userProfileFormSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(formErrors<ProfileFormValues>(parsed.error.issues));
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setFieldErrors({});
    try {
      const saved = await userApi.updateProfile(parsed.data);
      setForm(profileFormValues(saved));
      updateProfile({
        name: saved.name,
        email: saved.email,
        phone: saved.phone,
      });
      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof UserApiError && error.status === 409
          ? "Este e-mail já está associado a outra conta."
          : "Não foi possível salvar o perfil. Tente novamente.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  const isLoading = authStatus === "loading" || resource.isLoading;
  const loadError = resource.error
    ? "Não foi possível carregar o perfil. Tente novamente."
    : "";
  const organizations = user?.organizations ?? [];

  return (
    <section aria-labelledby="profile-heading" className="dashboard-page">
      <ToastContainer autoClose={4000} position="bottom-right" />
      <header className={styles.pageHeading}>
        <h1 id="profile-heading">Perfil</h1>
        <p>Gerencie seus dados pessoais e consulte seus papéis de acesso.</p>
      </header>

      {isLoading && !resource.data && (
        <div className={styles.loading} role="status">
          Carregando perfil...
        </div>
      )}

      {loadError && !resource.data && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          <button onClick={resource.retry} type="button">
            Tentar novamente
          </button>
        </div>
      )}

      {resource.isRefreshing && (
        <p className={styles.refreshStatus} role="status">
          Atualizando perfil...
        </p>
      )}

      {loadError && resource.data && (
        <p className={styles.refreshError} role="alert">
          {loadError}
        </p>
      )}

      {resource.data && (
        <>
          <section aria-labelledby="personal-data-heading" className={styles.card}>
            <header className={styles.sectionHeading}>
              <div>
                <h2 id="personal-data-heading">Dados pessoais</h2>
                <p>O e-mail informado também é usado para entrar na conta.</p>
              </div>
            </header>

            <form className={styles.form} noValidate onSubmit={saveProfile}>
              <label className={styles.field}>
                <span>Nome</span>
                <input
                  aria-describedby={fieldErrors.name ? "profile-name-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.name)}
                  autoComplete="name"
                  maxLength={120}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                  value={form.name}
                />
                <FieldError id="profile-name-error" message={fieldErrors.name} />
              </label>

              <label className={styles.field}>
                <span>E-mail</span>
                <input
                  aria-describedby={fieldErrors.email ? "profile-email-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  maxLength={320}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  type="email"
                  value={form.email}
                />
                <FieldError id="profile-email-error" message={fieldErrors.email} />
              </label>

              <label className={styles.field}>
                <span>Telefone</span>
                <input
                  aria-describedby={fieldErrors.phone ? "profile-phone-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={15}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="11987654321"
                  type="tel"
                  value={form.phone}
                />
                <FieldError id="profile-phone-error" message={fieldErrors.phone} />
              </label>

              {saveError && (
                <p className={styles.formError} role="alert">
                  {saveError}
                </p>
              )}
              <div className={styles.actions}>
                <button disabled={isSaving} type="submit">
                  {isSaving ? "Salvando..." : "Salvar perfil"}
                </button>
              </div>
            </form>
          </section>

          <section aria-labelledby="access-heading" className={styles.card}>
            <header className={styles.sectionHeading}>
              <div>
                <h2 id="access-heading">Papéis de acesso</h2>
                <p>Os papéis são definidos por organização e não podem ser alterados aqui.</p>
              </div>
            </header>
            {organizations.length > 0 ? (
              <ul className={styles.membershipList}>
                {organizations.map((organization) => (
                  <li key={organization.id}>
                    <span>{organization.name}</span>
                    <span className={styles.role}>
                      {roleLabel(organization.role)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noOrganizations}>
                Sua conta ainda não está vinculada a uma organização.
              </p>
            )}
          </section>
        </>
      )}
    </section>
  );
}
