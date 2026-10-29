"use client";

import {
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import { AiOutlinePlus } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import {
  EmptyState,
  TableLoadingState,
} from "../../../components/dashboard/table-feedback";
import { FieldError } from "../../../components/forms/field-error";
import { PageHeading } from "../../../components/dashboard/page-heading";
import { useLocationsContainer } from "./container";
import styles from "./locations.module.css";

export default function LocationsPage() {
  const {
    allVisibleSelected,
    closeDialog,
    confirmDelete,
    currentLocations,
    form,
    fieldErrors,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isRefreshing,
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
    retryLoading,
    selectedIds,
    someVisibleSelected,
    submitLocation,
    togglePageSelection,
    toggleSelection,
    updateFormField,
  } = useLocationsContainer();

  return (
    <section
      aria-labelledby="locations-heading"
      className={`dashboard-page ${styles.page}`}
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionDisabled={!organizationId}
        actionIcon={<AiOutlinePlus aria-hidden="true" size={14} />}
        actionLabel="Nova unidade"
        description="Gerencie as unidades e filiais da sua organização."
        headingId="locations-heading"
        onAction={openCreateDialog}
        title="Unidades"
      />

      {loadError && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          {organizationId && (
            <button
              className={styles.retryButton}
              onClick={retryLoading}
              type="button"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <TableLoadingState columns={7} label="Carregando unidades..." />
      )}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para gerenciar unidades."
          title="Organização indisponível"
        />
      )}

      {!isLoading &&
        organizationId &&
        !loadError &&
        locationPage &&
        currentLocations.length === 0 && (
          <EmptyState
            description="Cadastre uma unidade para manter as filiais da sua organização organizadas."
            title="Nenhuma unidade cadastrada."
          />
        )}

      {locationPage && currentLocations.length > 0 && (
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <p>
              {locationPage.total}{" "}
              {locationPage.total === 1
                ? "unidade cadastrada"
                : "unidades cadastradas"}
            </p>
            {selectedIds.length > 0 && (
              <button
                className={styles.bulkDeleteButton}
                onClick={openBulkDeleteDialog}
                type="button"
              >
                <AiOutlineDelete aria-hidden="true" size={14} />
                Excluir selecionadas ({selectedIds.length})
              </button>
            )}
          </div>

          {isRefreshing && (
            <p className={styles.refreshStatus} role="status">
              Atualizando lista...
            </p>
          )}

          <div className={styles.tableScroll}>
            <table
              aria-label="Unidades da organização"
              className={styles.table}
            >
              <thead>
                <tr>
                  <th className={styles.selectionColumn}>
                    <input
                      aria-checked={
                        someVisibleSelected && !allVisibleSelected
                          ? "mixed"
                          : allVisibleSelected
                      }
                      aria-label="Selecionar todas as unidades desta página"
                      checked={allVisibleSelected}
                      onChange={togglePageSelection}
                      type="checkbox"
                    />
                  </th>
                  <th scope="col">Unidade</th>
                  <th scope="col">Cidade / estado</th>
                  <th scope="col">Endereço</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Gestor</th>
                  <th className={styles.actionsHeading} scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLocations.map((location) => (
                  <tr key={location.id}>
                    <td className={styles.selectionColumn}>
                      <input
                        aria-label={`Selecionar ${location.name}`}
                        checked={selectedIds.includes(location.id)}
                        onChange={() => toggleSelection(location.id)}
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <span className={styles.locationName}>
                        {location.name}
                      </span>
                    </td>
                    <td>
                      {location.city}, {location.state}
                    </td>
                    <td className={styles.addressCell}>{location.address}</td>
                    <td>{location.phone || "—"}</td>
                    <td>{location.managerName || "—"}</td>
                    <td className={styles.actions}>
                      <button
                        aria-label={`Editar ${location.name}`}
                        className={styles.iconButton}
                        onClick={() => openEditDialog(location)}
                        type="button"
                      >
                        <AiOutlineEdit aria-hidden="true" size={14} />
                      </button>
                      <button
                        aria-label={`Excluir ${location.name}`}
                        className={`${styles.iconButton} ${styles.dangerButton}`}
                        onClick={() => openDeleteDialog(location)}
                        type="button"
                      >
                        <AiOutlineDelete aria-hidden="true" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className={styles.pagination}>
            <span>
              Página {locationPage.page ?? page} de {pageCount}
            </span>
            <div className={styles.paginationControls}>
              <button
                aria-label="Página anterior"
                disabled={locationPage.page <= 1 || isRefreshing}
                onClick={goToPreviousPage}
                type="button"
              >
                Anterior
              </button>
              <button
                aria-label="Próxima página"
                disabled={locationPage.page >= pageCount || isRefreshing}
                onClick={goToNextPage}
                type="button"
              >
                Próxima
              </button>
            </div>
          </footer>
        </div>
      )}

      {locationDialog && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="location-dialog-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            {(locationDialog.type === "create" ||
              locationDialog.type === "edit") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="location-dialog-heading">
                    {locationDialog.type === "create"
                      ? "Nova unidade"
                      : "Editar unidade"}
                  </h2>
                  <p>
                    Informe os dados da unidade. Telefone, descrição e gestor
                    são opcionais.
                  </p>
                </header>
                <form
                  className={styles.form}
                  noValidate
                  onSubmit={submitLocation}
                >
                  <label>
                    Nome
                    <input
                      aria-describedby={
                        fieldErrors.name ? "location-name-error" : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.name)}
                      autoFocus
                      maxLength={120}
                      onChange={(event) =>
                        updateFormField("name", event.target.value)
                      }
                      required
                      value={form.name}
                    />
                    <FieldError
                      id="location-name-error"
                      message={fieldErrors.name}
                    />
                  </label>
                  <label>
                    Endereço
                    <input
                      aria-describedby={
                        fieldErrors.address
                          ? "location-address-error"
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.address)}
                      maxLength={250}
                      onChange={(event) =>
                        updateFormField("address", event.target.value)
                      }
                      required
                      value={form.address}
                    />
                    <FieldError
                      id="location-address-error"
                      message={fieldErrors.address}
                    />
                  </label>
                  <div className={styles.formRow}>
                    <label>
                      Cidade
                      <input
                        aria-describedby={
                          fieldErrors.city ? "location-city-error" : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.city)}
                        maxLength={100}
                        onChange={(event) =>
                          updateFormField("city", event.target.value)
                        }
                        required
                        value={form.city}
                      />
                      <FieldError
                        id="location-city-error"
                        message={fieldErrors.city}
                      />
                    </label>
                    <label>
                      Estado
                      <input
                        aria-describedby={
                          fieldErrors.state
                            ? "location-state-error"
                            : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.state)}
                        maxLength={100}
                        onChange={(event) =>
                          updateFormField("state", event.target.value)
                        }
                        required
                        value={form.state}
                      />
                      <FieldError
                        id="location-state-error"
                        message={fieldErrors.state}
                      />
                    </label>
                  </div>
                  <div className={styles.formRow}>
                    <label>
                      Telefone
                      <input
                        aria-describedby={
                          fieldErrors.phone
                            ? "location-phone-error"
                            : undefined
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
                        id="location-phone-error"
                        message={fieldErrors.phone}
                      />
                    </label>
                    <label>
                      Gestor
                      <input
                        aria-describedby={
                          fieldErrors.managerName
                            ? "location-manager-error"
                            : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.managerName)}
                        maxLength={120}
                        onChange={(event) =>
                          updateFormField("managerName", event.target.value)
                        }
                        value={form.managerName}
                      />
                      <FieldError
                        id="location-manager-error"
                        message={fieldErrors.managerName}
                      />
                    </label>
                  </div>
                  <label>
                    Descrição
                    <textarea
                      aria-describedby={
                        fieldErrors.description
                          ? "location-description-error"
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.description)}
                      maxLength={500}
                      onChange={(event) =>
                        updateFormField("description", event.target.value)
                      }
                      rows={3}
                      value={form.description}
                    />
                    <FieldError
                      id="location-description-error"
                      message={fieldErrors.description}
                    />
                  </label>
                  {mutationError && (
                    <p className={styles.dialogError} role="alert">
                      {mutationError}
                    </p>
                  )}
                  <div className={styles.dialogActions}>
                    <button
                      className={styles.secondaryButton}
                      disabled={isSubmitting}
                      onClick={closeDialog}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className={styles.confirmButton}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting
                        ? "Salvando..."
                        : locationDialog.type === "create"
                          ? "Salvar unidade"
                          : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {(locationDialog.type === "delete" ||
              locationDialog.type === "bulk-delete") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="location-dialog-heading">
                    {locationDialog.type === "bulk-delete"
                      ? "Excluir unidades selecionadas?"
                      : "Excluir unidade?"}
                  </h2>
                  <p>
                    {locationDialog.type === "bulk-delete"
                      ? `${selectedIds.length} unidade(s) serão excluídas. Essa ação não pode ser desfeita.`
                      : `${locationDialog.location.name} será excluída. Essa ação não pode ser desfeita.`}
                  </p>
                </header>
                {mutationError && (
                  <p className={styles.dialogError} role="alert">
                    {mutationError}
                  </p>
                )}
                <div className={styles.dialogActions}>
                  <button
                    className={styles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={closeDialog}
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
                    {isSubmitting
                      ? "Excluindo..."
                      : locationDialog.type === "bulk-delete"
                        ? "Excluir unidades"
                        : "Excluir unidade"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
