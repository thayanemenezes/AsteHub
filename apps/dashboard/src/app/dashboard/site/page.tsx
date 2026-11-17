"use client";

import { AiOutlineEye, AiTwotoneDelete } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import { EmptyState } from "../../../components/dashboard/table-feedback";
import { FieldError } from "../../../components/forms/field-error";
import { PageHeading } from "../../../components/dashboard/page-heading";
import { useSiteContainer } from "./container";
import styles from "./site.module.css";

export default function SitePage() {
  const {
    confirmDelete,
    form,
    fieldErrors,
    isDeleteDialogOpen,
    isLoading,
    isRefreshing,
    isSubmitting,
    loadError,
    mutationError,
    organizationId,
    retryLoading,
    setIsDeleteDialogOpen,
    site,
    submitSite,
    updateFormField,
  } = useSiteContainer();

  return (
    <section
      aria-labelledby="site-heading"
      className={`dashboard-page ${styles.page}`}
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionHref="http://localhost:3001"
        target="_blank"
        actionIcon={<AiOutlineEye aria-hidden="true" size={14} />}
        actionLabel="Visitar site"
        description="Configure a identidade pública e os dados de contato do site da sua locadora."
        headingId="site-heading"
        title="Site"
      />

      {loadError && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          {organizationId && (
            <button onClick={retryLoading} type="button">
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div className={styles.loading} role="status">
          Carregando configuração do site...
        </div>
      )}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para configurar o site."
          title="Organização indisponível"
        />
      )}

      {isRefreshing && (
        <p className={styles.refreshStatus} role="status">
          Atualizando configuração...
        </p>
      )}

      {!isLoading && organizationId && !loadError && (
        <section className={styles.formCard}>
          <form
            aria-label="Configuração do site"
            className={styles.form}
            noValidate
            onSubmit={submitSite}
          >
            <div className={styles.formHeading}>
              <h2>Configuração do site</h2>
              <p>
                Nome público e identificador são obrigatórios. Os demais dados
                são opcionais.
              </p>
            </div>

            <label>
              Nome público
              <input
                aria-describedby={
                  fieldErrors.publicName ? "site-public-name-error" : undefined
                }
                aria-invalid={Boolean(fieldErrors.publicName)}
                maxLength={120}
                onChange={(event) =>
                  updateFormField("publicName", event.target.value)
                }
                required
                value={form.publicName}
              />
              <FieldError
                id="site-public-name-error"
                message={fieldErrors.publicName}
              />
            </label>

            <div className={styles.formRow}>
              <label>
                Identificador do site
                <input
                  aria-label="Identificador do site"
                  aria-describedby={
                    fieldErrors.slug ? "site-slug-error" : "site-slug-help"
                  }
                  aria-invalid={Boolean(fieldErrors.slug)}
                  maxLength={60}
                  onChange={(event) =>
                    updateFormField("slug", event.target.value)
                  }
                  pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                  placeholder="minha-locadora"
                  required
                  value={form.slug}
                />
                <span className={styles.helpText}>
                  <span id="site-slug-help">
                  Use letras, números e hífens.
                  </span>
                </span>
                <FieldError id="site-slug-error" message={fieldErrors.slug} />
              </label>
              <label>
                Domínio
                <input
                  aria-describedby={
                    fieldErrors.domain ? "site-domain-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.domain)}
                  maxLength={253}
                  onChange={(event) =>
                    updateFormField("domain", event.target.value)
                  }
                  placeholder="www.minhalocadora.com.br"
                  value={form.domain}
                />
                <FieldError
                  id="site-domain-error"
                  message={fieldErrors.domain}
                />
              </label>
            </div>

            <label className={styles.publicationField}>
              <input
                aria-label="Publicar site"
                checked={form.isPublished}
                onChange={(event) =>
                  updateFormField("isPublished", event.target.checked)
                }
                type="checkbox"
              />
              Publicar site
              <span>
                Quando publicado, o site e os conteúdos publicados ficam
                disponíveis publicamente.
              </span>
            </label>

            <div className={styles.formRow}>
              <label>
                Telefone
                <input
                  aria-describedby={
                    fieldErrors.phone ? "site-phone-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.phone)}
                  inputMode="numeric"
                  maxLength={15}
                  onChange={(event) =>
                    updateFormField("phone", event.target.value)
                  }
                  pattern="[0-9]*"
                  type="tel"
                  value={form.phone}
                />
                <FieldError
                  id="site-phone-error"
                  message={fieldErrors.phone}
                />
              </label>
              <label>
                URL do logotipo
                <input
                  aria-describedby={
                    fieldErrors.logoUrl ? "site-logo-error" : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.logoUrl)}
                  maxLength={2048}
                  onChange={(event) =>
                    updateFormField("logoUrl", event.target.value)
                  }
                  placeholder="https://..."
                  type="url"
                  value={form.logoUrl}
                />
                <FieldError id="site-logo-error" message={fieldErrors.logoUrl} />
              </label>
            </div>

            <label>
              Descrição
              <textarea
                aria-describedby={
                  fieldErrors.description ? "site-description-error" : undefined
                }
                aria-invalid={Boolean(fieldErrors.description)}
                maxLength={1000}
                onChange={(event) =>
                  updateFormField("description", event.target.value)
                }
                rows={4}
                value={form.description}
              />
              <FieldError
                id="site-description-error"
                message={fieldErrors.description}
              />
            </label>

            <div className={styles.formRow}>
              <label>
                Cor principal
                <input
                  aria-describedby={
                    fieldErrors.primaryColor
                      ? "site-primary-color-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.primaryColor)}
                  maxLength={7}
                  onChange={(event) =>
                    updateFormField("primaryColor", event.target.value)
                  }
                  pattern="#[0-9a-fA-F]{6}"
                  placeholder="#282B74"
                  value={form.primaryColor}
                />
                <FieldError
                  id="site-primary-color-error"
                  message={fieldErrors.primaryColor}
                />
              </label>
              <label>
                Cor secundária
                <input
                  aria-describedby={
                    fieldErrors.secondaryColor
                      ? "site-secondary-color-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.secondaryColor)}
                  maxLength={7}
                  onChange={(event) =>
                    updateFormField("secondaryColor", event.target.value)
                  }
                  pattern="#[0-9a-fA-F]{6}"
                  placeholder="#F2F2F8"
                  value={form.secondaryColor}
                />
                <FieldError
                  id="site-secondary-color-error"
                  message={fieldErrors.secondaryColor}
                />
              </label>
            </div>

            {mutationError && (
              <p className={styles.formError} role="alert">
                {mutationError}
              </p>
            )}

            <div className={styles.formActions}>
              {site && (
                <button
                  className={styles.deleteButton}
                  disabled={isSubmitting || isRefreshing}
                  onClick={() => setIsDeleteDialogOpen(true)}
                  type="button"
                >
                  <AiTwotoneDelete aria-hidden="true" size={14} />
                  Excluir configuração
                </button>
              )}
              <button
                className={styles.saveButton}
                disabled={isSubmitting || isRefreshing}
                type="submit"
              >
                {isSubmitting
                  ? "Salvando..."
                  : site
                    ? "Salvar alterações"
                    : "Salvar configuração"}
              </button>
            </div>
          </form>
        </section>
      )}

      {isDeleteDialogOpen && site && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="delete-site-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <h2 id="delete-site-heading">Excluir configuração?</h2>
            <p>
              A configuração do site de {site.publicName} será excluída. Essa
              ação não pode ser desfeita.
            </p>
            {mutationError && (
              <p className={styles.formError} role="alert">
                {mutationError}
              </p>
            )}
            <div className={styles.formActions}>
              <button
                className={styles.secondaryButton}
                disabled={isSubmitting}
                onClick={() => setIsDeleteDialogOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className={styles.dangerConfirmButton}
                disabled={isSubmitting}
                onClick={() => void confirmDelete()}
                type="button"
              >
                {isSubmitting ? "Excluindo..." : "Excluir site"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
