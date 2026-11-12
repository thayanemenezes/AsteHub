"use client";

import { ToastContainer } from "react-toastify";
import { FieldError } from "../../../components/forms/field-error";
import { useSettingsContainer } from "./container";
import styles from "./settings.module.css";

export default function SettingsForm() {
  const {
    fieldErrors,
    form,
    hasSettings,
    isLoading,
    isRefreshing,
    isSavingLanguage,
    isSavingSite,
    languageError,
    loadError,
    organizationId,
    retryLoading,
    saveLanguage,
    saveSite,
    siteError,
    updateLanguage,
    updateSiteField,
  } = useSettingsContainer();

  function field(
    name: keyof typeof fieldErrors,
    label: string,
    maxLength: number,
    placeholder?: string,
    type = "text",
  ) {
    const errorId = `settings-${name}-error`;
    return (
      <label className={styles.field}>
        <span>{label}</span>
        <input
          aria-describedby={fieldErrors[name] ? errorId : undefined}
          aria-invalid={Boolean(fieldErrors[name])}
          maxLength={maxLength}
          onChange={(event) => updateSiteField(name, event.target.value)}
          placeholder={placeholder}
          type={type}
          value={form[name]}
        />
        <FieldError id={errorId} message={fieldErrors[name]} />
      </label>
    );
  }

  return (
    <section aria-labelledby="settings-heading" className="dashboard-page">
      <ToastContainer autoClose={4000} position="bottom-right" />
      <header className={styles.pageHeading}>
        <h1 id="settings-heading">Configurações</h1>
        <p>
          Gerencie as preferências da sua conta e a presença digital da
          organização.
        </p>
      </header>

      {isLoading && (
        <div className={styles.loading} role="status">
          Carregando configurações...
        </div>
      )}

      {loadError && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          <button onClick={retryLoading} type="button">
            Tentar novamente
          </button>
        </div>
      )}

      {isRefreshing && (
        <p className={styles.refreshStatus} role="status">
          Atualizando configurações...
        </p>
      )}

      {!isLoading && (!loadError || hasSettings) && (
        <>
          <section
            aria-labelledby="account-settings-heading"
            className={styles.card}
          >
            <header className={styles.sectionHeading}>
              <div>
                <h2 id="account-settings-heading">Preferências da conta</h2>
                <p>Escolha o idioma preferido para o dashboard.</p>
              </div>
            </header>
            <form className={styles.form} onSubmit={saveLanguage}>
              <label className={styles.field}>
                <span>Idioma do dashboard</span>
                <select
                  onChange={(event) => updateLanguage(event.target.value)}
                  value={form.language}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                </select>
              </label>
              {languageError && (
                <p className={styles.formError} role="alert">
                  {languageError}
                </p>
              )}
              <div className={styles.actions}>
                <button disabled={isSavingLanguage} type="submit">
                  {isSavingLanguage ? "Salvando..." : "Salvar preferência"}
                </button>
              </div>
            </form>
          </section>

          <section
            aria-labelledby="site-settings-heading"
            className={styles.card}
          >
            <header className={styles.sectionHeading}>
              <div>
                <h2 id="site-settings-heading">Site e SEO</h2>
                <p>
                  Configure a identidade e os metadados exibidos nos resultados
                  de busca e ao compartilhar o site.
                </p>
              </div>
            </header>

            {!organizationId && (
              <p className={styles.error} role="alert">
                Associe uma organização ativa para editar as configurações do
                site.
              </p>
            )}

            <form
              aria-label="Configurações do site"
              className={styles.form}
              noValidate
              onSubmit={saveSite}
            >
              <div className={styles.fields}>
                {field("publicName", "Nome público", 120)}
                {field("slug", "Identificador do site", 60, "minha-locadora")}
                {field("domain", "Domínio", 253, "www.minhalocadora.com.br")}
                {field("phone", "Telefone", 40, "(11) 3333-4444", "tel")}
              </div>

              <label className={styles.field}>
                <span>Descrição do site</span>
                <textarea
                  aria-describedby={
                    fieldErrors.description
                      ? "settings-description-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.description)}
                  maxLength={1000}
                  onChange={(event) =>
                    updateSiteField("description", event.target.value)
                  }
                  rows={3}
                  value={form.description}
                />
                <FieldError
                  id="settings-description-error"
                  message={fieldErrors.description}
                />
              </label>

              <div className={styles.fields}>
                {field(
                  "logoUrl",
                  "URL do logotipo (HTTPS)",
                  2048,
                  "https://...",
                  "url",
                )}
                {field("primaryColor", "Cor principal", 7, "#282B74")}
                {field("secondaryColor", "Cor secundária", 7, "#F2F2F8")}
              </div>

              <div className={styles.divider} />
              <h3 className={styles.subheading}>Otimização para buscadores</h3>
              <div className={styles.fields}>
                {field("seoTitle", "Título SEO", 70)}
                {field("ogTitle", "Título para compartilhamento", 95)}
              </div>
              <label className={styles.field}>
                <span>Descrição SEO</span>
                <textarea
                  aria-describedby={
                    fieldErrors.seoDescription
                      ? "settings-seo-description-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.seoDescription)}
                  maxLength={320}
                  onChange={(event) =>
                    updateSiteField("seoDescription", event.target.value)
                  }
                  rows={3}
                  value={form.seoDescription}
                />
                <FieldError
                  id="settings-seo-description-error"
                  message={fieldErrors.seoDescription}
                />
              </label>
              <div className={styles.fields}>
                {field(
                  "ogImageUrl",
                  "Imagem Open Graph (HTTPS)",
                  2048,
                  "https://...",
                  "url",
                )}
              </div>
              <label className={styles.field}>
                <span>Descrição para compartilhamento</span>
                <textarea
                  aria-describedby={
                    fieldErrors.ogDescription
                      ? "settings-og-description-error"
                      : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.ogDescription)}
                  maxLength={200}
                  onChange={(event) =>
                    updateSiteField("ogDescription", event.target.value)
                  }
                  rows={3}
                  value={form.ogDescription}
                />
                <FieldError
                  id="settings-og-description-error"
                  message={fieldErrors.ogDescription}
                />
              </label>

              {siteError && (
                <p className={styles.formError} role="alert">
                  {siteError}
                </p>
              )}
              <div className={styles.actions}>
                <button
                  disabled={!organizationId || isSavingSite}
                  type="submit"
                >
                  {isSavingSite
                    ? "Salvando..."
                    : "Salvar configurações do site"}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </section>
  );
}
