"use client";

import { useVehiclesContainer } from "./container";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { AiTwotoneEdit } from "react-icons/ai";
import { AiTwotoneDelete } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import {
  EmptyState,
  TableLoadingState,
} from "../../../components/dashboard/table-feedback";
import { FieldError } from "../../../components/forms/field-error";
import { PageHeading } from "../../../components/dashboard/page-heading";
import styles from "./vehicles.module.css";

function VehicleActionIcon({ name }: { name: "edit" | "delete" }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {name === "edit" ? (
        <>
          <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
          <path d="M13 20h7" />
        </>
      ) : (
        <>
          <path d="M4 7h16m-10 4v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </>
      )}
    </svg>
  );
}

export default function VehiclesPage() {
  const {
    allVisibleSelected,
    closeDialog,
    confirmDelete,
    currentVehicles,
    form,
    fieldErrors,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isRefreshing,
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
    retryLoading,
    selectedIds,
    someVisibleSelected,
    submitVehicle,
    togglePageSelection,
    toggleSelection,
    updateFormField,
    vehicleDialog,
    vehiclePage,
  } = useVehiclesContainer();

  return (
    <section
      className={`dashboard-page ${styles.page}`}
      aria-labelledby="vehicles-heading"
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionDisabled={!organizationId}
        actionIcon={<AiOutlinePlus aria-hidden="true" size={14} />}
        actionLabel="Novo veículo"
        description="Gerencie os veículos disponíveis no catálogo da sua organização."
        headingId="vehicles-heading"
        onAction={openCreateDialog}
        title="Veículos"
      />

      {loadError && (
        <div className="vehicle-error" role="alert">
          <p>{loadError}</p>
          {organizationId && (
            <button
              className="vehicle-text-button"
              onClick={retryLoading}
              type="button"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <TableLoadingState columns={5} label="Carregando veículos..." />
      )}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para gerenciar veículos."
          title="Organização indisponível"
        />
      )}

      {!isLoading &&
        organizationId &&
        !loadError &&
        vehiclePage &&
        currentVehicles.length === 0 && (
          <EmptyState
            description="Cadastre o primeiro veículo para começar a organizar seu catálogo."
            title="Nenhum veículo cadastrado."
          />
        )}

      {vehiclePage && currentVehicles.length > 0 && (
        <div className="vehicle-list-card">
          <div className="vehicle-list-toolbar">
            <p>
              {vehiclePage?.total ?? 0}{" "}
              {(vehiclePage?.total ?? 0) === 1
                ? "veículo cadastrado"
                : "veículos cadastrados"}
            </p>
            {selectedIds.length > 0 && (
              <button
                className="vehicle-bulk-delete-button"
                onClick={openBulkDeleteDialog}
                type="button"
              >
                <VehicleActionIcon name="delete" />
                Excluir selecionados ({selectedIds.length})
              </button>
            )}
          </div>

          {isRefreshing && (
            <p className="vehicle-refresh-status" role="status">
              Atualizando lista...
            </p>
          )}

          <div className="vehicle-table-scroll">
            <table
              aria-label="Veículos da organização"
              className="vehicle-table"
            >
              <thead>
                <tr>
                  <th className="vehicle-selection-column">
                    <input
                      aria-checked={
                        someVisibleSelected && !allVisibleSelected
                          ? "mixed"
                          : allVisibleSelected
                      }
                      aria-label="Selecionar todos os veículos desta página"
                      checked={allVisibleSelected}
                      onChange={togglePageSelection}
                      type="checkbox"
                    />
                  </th>
                  <th scope="col">Veículo</th>
                  <th scope="col">Ano</th>
                  <th scope="col">Descrição</th>
                  <th className="vehicle-actions-heading" scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="vehicle-selection-column">
                      <input
                        aria-label={`Selecionar ${vehicle.make} ${vehicle.model}`}
                        checked={selectedIds.includes(vehicle.id)}
                        onChange={() => toggleSelection(vehicle.id)}
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <span className="vehicle-name">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </td>
                    <td>{vehicle.year}</td>
                    <td className="vehicle-description-cell">
                      {vehicle.description || "—"}
                    </td>
                    <td className="vehicle-actions">
                      <button
                        aria-label={`Editar ${vehicle.make} ${vehicle.model}`}
                        className="vehicle-icon-button"
                        onClick={() => openEditDialog(vehicle)}
                        type="button"
                      >
                        <AiOutlineEdit size={14} />
                      </button>
                      <button
                        aria-label={`Excluir ${vehicle.make} ${vehicle.model}`}
                        className="vehicle-icon-button vehicle-icon-button--danger"
                        onClick={() => openDeleteDialog(vehicle)}
                        type="button"
                      >
                        <AiOutlineDelete size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="vehicle-pagination">
            <span>
              Página {vehiclePage?.page ?? page} de {pageCount}
            </span>
            <div>
              <button
                aria-label="Página anterior"
                disabled={(vehiclePage?.page ?? page) <= 1 || isRefreshing}
                onClick={goToPreviousPage}
                type="button"
              >
                Anterior
              </button>
              <button
                aria-label="Próxima página"
                disabled={(vehiclePage?.page ?? page) >= pageCount || isRefreshing}
                onClick={goToNextPage}
                type="button"
              >
                Próxima
              </button>
            </div>
          </footer>
        </div>
      )}

      {vehicleDialog && (
        <div className="vehicle-dialog-backdrop">
          <section
            aria-labelledby="vehicle-dialog-heading"
            aria-modal="true"
            className="vehicle-dialog"
            role="dialog"
          >
            {(vehicleDialog.type === "create" ||
              vehicleDialog.type === "edit") && (
              <>
                <header className="vehicle-dialog-heading">
                  <h2 id="vehicle-dialog-heading">
                    {vehicleDialog.type === "create"
                      ? "Novo veículo"
                      : "Editar veículo"}
                  </h2>
                  <p>Preencha os dados principais do veículo.</p>
                </header>
                <form
                  className="vehicle-form"
                  noValidate
                  onSubmit={submitVehicle}
                >
                  <label>
                    Marca
                    <input
                      aria-describedby={
                        fieldErrors.make ? "vehicle-make-error" : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.make)}
                      autoFocus
                      maxLength={80}
                      onChange={(event) =>
                        updateFormField("make", event.target.value)
                      }
                      required
                      value={form.make}
                    />
                    <FieldError
                      id="vehicle-make-error"
                      message={fieldErrors.make}
                    />
                  </label>
                  <label>
                    Modelo
                    <input
                      aria-describedby={
                        fieldErrors.model ? "vehicle-model-error" : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.model)}
                      maxLength={100}
                      onChange={(event) =>
                        updateFormField("model", event.target.value)
                      }
                      required
                      value={form.model}
                    />
                    <FieldError
                      id="vehicle-model-error"
                      message={fieldErrors.model}
                    />
                  </label>
                  <label>
                    Ano
                    <input
                      aria-describedby={
                        fieldErrors.year ? "vehicle-year-error" : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.year)}
                      max={2100}
                      min={1886}
                      inputMode="numeric"
                      onChange={(event) =>
                        updateFormField("year", event.target.value)
                      }
                      pattern="[0-9]*"
                      required
                      type="text"
                      value={form.year}
                    />
                    <FieldError
                      id="vehicle-year-error"
                      message={fieldErrors.year}
                    />
                  </label>
                  <label>
                    Descrição
                    <textarea
                      aria-describedby={
                        fieldErrors.description
                          ? "vehicle-description-error"
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.description)}
                      maxLength={1000}
                      onChange={(event) =>
                        updateFormField("description", event.target.value)
                      }
                      rows={3}
                      value={form.description}
                    />
                    <FieldError
                      id="vehicle-description-error"
                      message={fieldErrors.description}
                    />
                  </label>
                  {mutationError && (
                    <p className="vehicle-error-message" role="alert">
                      {mutationError}
                    </p>
                  )}
                  <div className="vehicle-dialog-actions">
                    <button
                      className="vehicle-secondary-button"
                      disabled={isSubmitting}
                      onClick={closeDialog}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="dashboard-primary-button"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting
                        ? "Salvando..."
                        : vehicleDialog.type === "create"
                          ? "Salvar veículo"
                          : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {(vehicleDialog.type === "delete" ||
              vehicleDialog.type === "bulk-delete") && (
              <>
                <header className="vehicle-dialog-heading">
                  <h2 id="vehicle-dialog-heading">
                    {vehicleDialog.type === "bulk-delete"
                      ? "Excluir veículos selecionados?"
                      : "Excluir veículo?"}
                  </h2>
                  <p>
                    {vehicleDialog.type === "bulk-delete"
                      ? `${selectedIds.length} veículo(s) serão excluídos. Essa ação não pode ser desfeita.`
                      : `${vehicleDialog.vehicle.make} ${vehicleDialog.vehicle.model} será excluído. Essa ação não pode ser desfeita.`}
                  </p>
                </header>
                {mutationError && (
                  <p className="vehicle-error-message" role="alert">
                    {mutationError}
                  </p>
                )}
                <div className="vehicle-dialog-actions">
                  <button
                    className="vehicle-secondary-button"
                    disabled={isSubmitting}
                    onClick={closeDialog}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="vehicle-danger-button"
                    disabled={isSubmitting}
                    onClick={() => void confirmDelete()}
                    type="button"
                  >
                    {isSubmitting
                      ? "Excluindo..."
                      : vehicleDialog.type === "bulk-delete"
                        ? "Excluir veículos"
                        : "Excluir veículo"}
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
