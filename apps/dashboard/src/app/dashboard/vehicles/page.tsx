"use client";

import { useVehiclesContainer } from "./container";

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
    feedback,
    form,
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
      className="dashboard-page vehicle-page"
      aria-labelledby="vehicles-heading"
    >
      <header className="dashboard-page-heading vehicle-page-heading">
        <div>
          <p className="dashboard-eyebrow">CATÁLOGO</p>
          <h1 id="vehicles-heading">Veículos</h1>
          <p>Gerencie os veículos disponíveis no catálogo da sua organização.</p>
        </div>
        <button
          className="dashboard-primary-button vehicle-create-button"
          disabled={!organizationId}
          onClick={openCreateDialog}
          type="button"
        >
          <span aria-hidden="true">+</span>
          Novo veículo
        </button>
      </header>

      {feedback && (
        <p className="vehicle-feedback" role="status">
          {feedback}
        </p>
      )}

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
        <div className="vehicle-loading" role="status">
          <span className="vehicle-spinner" aria-hidden="true" />
          Carregando veículos...
        </div>
      )}

      {!isLoading && !organizationId && (
        <div className="vehicle-empty-state">
          <h2>Organização indisponível</h2>
          <p>Associe uma organização ativa à sua conta para gerenciar veículos.</p>
        </div>
      )}

      {!isLoading &&
        organizationId &&
        !loadError &&
        vehiclePage &&
        currentVehicles.length === 0 && (
          <div className="vehicle-empty-state">
            <span className="vehicle-empty-icon" aria-hidden="true">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="m5 11 1.5-4h11l1.5 4M4 11h16v7H4zM7 18v2m10-2v2M4 14h2m12 0h2" />
              </svg>
            </span>
            <h2>Nenhum veículo cadastrado.</h2>
            <p>Cadastre o primeiro veículo para começar a organizar seu catálogo.</p>
            <button
              className="dashboard-primary-button"
              onClick={openCreateDialog}
              type="button"
            >
              Novo veículo
            </button>
          </div>
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
                        <VehicleActionIcon name="edit" />
                      </button>
                      <button
                        aria-label={`Excluir ${vehicle.make} ${vehicle.model}`}
                        className="vehicle-icon-button vehicle-icon-button--danger"
                        onClick={() => openDeleteDialog(vehicle)}
                        type="button"
                      >
                        <VehicleActionIcon name="delete" />
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
                <form className="vehicle-form" onSubmit={submitVehicle}>
                  <label>
                    Marca
                    <input
                      autoFocus
                      maxLength={80}
                      onChange={(event) =>
                        updateFormField("make", event.target.value)
                      }
                      required
                      value={form.make}
                    />
                  </label>
                  <label>
                    Modelo
                    <input
                      maxLength={100}
                      onChange={(event) =>
                        updateFormField("model", event.target.value)
                      }
                      required
                      value={form.model}
                    />
                  </label>
                  <label>
                    Ano
                    <input
                      max={2100}
                      min={1886}
                      onChange={(event) =>
                        updateFormField("year", event.target.value)
                      }
                      required
                      type="number"
                      value={form.year}
                    />
                  </label>
                  <label>
                    Descrição
                    <textarea
                      maxLength={1000}
                      onChange={(event) =>
                        updateFormField("description", event.target.value)
                      }
                      rows={3}
                      value={form.description}
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
