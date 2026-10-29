"use client";

import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import { EmptyState, TableLoadingState } from "../../../components/dashboard/table-feedback";
import { PageHeading } from "../../../components/dashboard/page-heading";
import { FieldError } from "../../../components/forms/field-error";
import type { LeadStatus } from "@repo/contracts";
import { useLeadsContainer } from "./container";
import styles from "./leads.module.css";

const statusLabels: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  CLOSED: "Encerrado",
};

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LeadsPage() {
  const {
    allVisibleSelected,
    closeDialog,
    confirmDelete,
    currentLeads,
    fieldErrors,
    form,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isRefreshing,
    isSubmitting,
    leadDialog,
    leadPage,
    loadError,
    locations,
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
    submitLead,
    togglePageSelection,
    toggleSelection,
    updateFormField,
    vehicles,
  } = useLeadsContainer();

  return (
    <section
      aria-labelledby="leads-heading"
      className={`dashboard-page ${styles.page}`}
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionDisabled={!organizationId}
        actionIcon={<AiOutlinePlus aria-hidden="true" size={14} />}
        actionLabel="Novo lead"
        description="Acompanhe e organize os contatos comerciais da sua organização."
        headingId="leads-heading"
        onAction={openCreateDialog}
        title="Leads"
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

      {isLoading && <TableLoadingState columns={7} label="Carregando leads..." />}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para gerenciar leads."
          title="Organização indisponível"
        />
      )}

      {!isLoading &&
        organizationId &&
        !loadError &&
        leadPage &&
        currentLeads.length === 0 && (
          <EmptyState
            description="Cadastre um contato recebido para começar a acompanhar os leads da sua organização."
            title="Nenhum lead cadastrado."
          />
        )}

      {leadPage && currentLeads.length > 0 && (
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <p>
              {leadPage.total}{" "}
              {leadPage.total === 1 ? "lead cadastrado" : "leads cadastrados"}
            </p>
            {selectedIds.length > 0 && (
              <button
                className={styles.bulkDeleteButton}
                onClick={openBulkDeleteDialog}
                type="button"
              >
                <AiOutlineDelete aria-hidden="true" size={14} />
                Excluir selecionados ({selectedIds.length})
              </button>
            )}
          </div>

          {isRefreshing && (
            <p className={styles.refreshStatus} role="status">
              Atualizando lista...
            </p>
          )}

          <div className={styles.tableScroll}>
            <table aria-label="Leads da organização" className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.selectionColumn}>
                    <input
                      aria-checked={
                        someVisibleSelected && !allVisibleSelected
                          ? "mixed"
                          : allVisibleSelected
                      }
                      aria-label="Selecionar todos os leads desta página"
                      checked={allVisibleSelected}
                      onChange={togglePageSelection}
                      type="checkbox"
                    />
                  </th>
                  <th scope="col">Contato</th>
                  <th scope="col">Telefone / e-mail</th>
                  <th scope="col">Interesse</th>
                  <th scope="col">Status</th>
                  <th scope="col">Recebido em</th>
                  <th className={styles.actionsHeading} scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className={styles.selectionColumn}>
                      <input
                        aria-label={`Selecionar ${lead.contactName}`}
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelection(lead.id)}
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <span className={styles.contactName}>
                        {lead.contactName}
                      </span>
                      <span className={styles.message}>{lead.message}</span>
                    </td>
                    <td>
                      <span>{lead.phone}</span>
                      {lead.email && (
                        <span className={styles.contactEmail}>{lead.email}</span>
                      )}
                    </td>
                    <td className={styles.interest}>
                      {lead.vehicle
                        ? `${lead.vehicle.make} ${lead.vehicle.model}`
                        : "Qualquer veículo"}
                      {lead.location && (
                        <span className={styles.contactEmail}>
                          {lead.location.name}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[`status${lead.status}`]}`}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td>{formattedDate(lead.createdAt)}</td>
                    <td className={styles.actions}>
                      <button
                        aria-label={`Editar lead de ${lead.contactName}`}
                        className={styles.iconButton}
                        onClick={() => openEditDialog(lead)}
                        type="button"
                      >
                        <AiOutlineEdit aria-hidden="true" size={14} />
                      </button>
                      <button
                        aria-label={`Excluir lead de ${lead.contactName}`}
                        className={`${styles.iconButton} ${styles.dangerButton}`}
                        onClick={() => openDeleteDialog(lead)}
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
              Página {leadPage.page ?? page} de {pageCount}
            </span>
            <div className={styles.paginationControls}>
              <button
                aria-label="Página anterior"
                disabled={leadPage.page <= 1 || isRefreshing}
                onClick={goToPreviousPage}
                type="button"
              >
                Anterior
              </button>
              <button
                aria-label="Próxima página"
                disabled={leadPage.page >= pageCount || isRefreshing}
                onClick={goToNextPage}
                type="button"
              >
                Próxima
              </button>
            </div>
          </footer>
        </div>
      )}

      {leadDialog && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="lead-dialog-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            {(leadDialog.type === "create" || leadDialog.type === "edit") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="lead-dialog-heading">
                    {leadDialog.type === "create" ? "Novo lead" : "Editar lead"}
                  </h2>
                  <p>
                    Informe o contato e a solicitação. O status inicial é Novo.
                  </p>
                </header>
                <form className={styles.form} noValidate onSubmit={submitLead}>
                  <label>
                    Nome do contato
                    <input
                      aria-describedby={
                        fieldErrors.contactName
                          ? "lead-contact-name-error"
                          : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.contactName)}
                      autoFocus
                      maxLength={120}
                      onChange={(event) =>
                        updateFormField("contactName", event.target.value)
                      }
                      required
                      value={form.contactName}
                    />
                    <FieldError
                      id="lead-contact-name-error"
                      message={fieldErrors.contactName}
                    />
                  </label>
                  <div className={styles.formRow}>
                    <label>
                      Telefone
                      <input
                        aria-describedby={
                          fieldErrors.phone ? "lead-phone-error" : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.phone)}
                        inputMode="numeric"
                        maxLength={15}
                        onChange={(event) =>
                          updateFormField("phone", event.target.value)
                        }
                        pattern="[0-9]*"
                        required
                        type="tel"
                        value={form.phone}
                      />
                      <FieldError
                        id="lead-phone-error"
                        message={fieldErrors.phone}
                      />
                    </label>
                    <label>
                      E-mail (opcional)
                      <input
                        aria-describedby={
                          fieldErrors.email ? "lead-email-error" : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.email)}
                        maxLength={320}
                        onChange={(event) =>
                          updateFormField("email", event.target.value)
                        }
                        type="email"
                        value={form.email}
                      />
                      <FieldError
                        id="lead-email-error"
                        message={fieldErrors.email}
                      />
                    </label>
                  </div>
                  <div className={styles.formRow}>
                    <label>
                      Veículo de interesse (opcional)
                      <select
                        onChange={(event) =>
                          updateFormField("vehicleId", event.target.value)
                        }
                        value={form.vehicleId}
                      >
                        <option value="">Qualquer veículo</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Unidade (opcional)
                      <select
                        onChange={(event) =>
                          updateFormField("locationId", event.target.value)
                        }
                        value={form.locationId}
                      >
                        <option value="">Sem unidade definida</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Mensagem
                    <textarea
                      aria-describedby={
                        fieldErrors.message ? "lead-message-error" : undefined
                      }
                      aria-invalid={Boolean(fieldErrors.message)}
                      maxLength={1000}
                      onChange={(event) =>
                        updateFormField("message", event.target.value)
                      }
                      required
                      rows={4}
                      value={form.message}
                    />
                    <FieldError
                      id="lead-message-error"
                      message={fieldErrors.message}
                    />
                  </label>
                  {leadDialog.type === "edit" && (
                    <label>
                      Status
                      <select
                        onChange={(event) =>
                          updateFormField(
                            "status",
                            event.target.value as LeadStatus,
                          )
                        }
                        value={form.status}
                      >
                        <option value="NEW">Novo</option>
                        <option value="CONTACTED">Contatado</option>
                        <option value="CLOSED">Encerrado</option>
                      </select>
                    </label>
                  )}
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
                        : leadDialog.type === "create"
                          ? "Salvar lead"
                          : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {(leadDialog.type === "delete" ||
              leadDialog.type === "bulk-delete") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="lead-dialog-heading">
                    {leadDialog.type === "delete"
                      ? "Excluir lead?"
                      : "Excluir leads selecionados?"}
                  </h2>
                  <p>
                    {leadDialog.type === "delete"
                      ? `O lead de ${leadDialog.lead.contactName} será excluído permanentemente.`
                      : `${selectedIds.length} leads serão excluídos permanentemente.`}
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
                    onClick={confirmDelete}
                    type="button"
                  >
                    {isSubmitting ? "Excluindo..." : "Excluir leads"}
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
