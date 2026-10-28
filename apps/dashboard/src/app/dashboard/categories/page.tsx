"use client";

import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiTwotoneDelete,
  AiTwotoneEdit,
} from "react-icons/ai";
import { AiOutlinePlus } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import {
  EmptyState,
  TableLoadingState,
} from "../../../components/dashboard/table-feedback";
import { PageHeading } from "../../../components/dashboard/page-heading";
import { useVehicleCategoriesContainer } from "./container";
import styles from "./categories.module.css";

export default function CategoriesPage() {
  const {
    allVisibleSelected,
    categoryDialog,
    categoryPage,
    closeDialog,
    confirmDelete,
    currentCategories,
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
    submitCategory,
    togglePageSelection,
    toggleSelection,
    updateFormField,
  } = useVehicleCategoriesContainer();

  return (
    <section
      aria-labelledby="categories-heading"
      className={`dashboard-page ${styles.page}`}
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionDisabled={!organizationId}
        actionIcon={<AiOutlinePlus aria-hidden="true" size={14} />}
        actionLabel="Nova categoria"
        description="Organize as categorias utilizadas no catálogo de veículos."
        headingId="categories-heading"
        onAction={openCreateDialog}
        title="Categorias"
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
        <TableLoadingState columns={4} label="Carregando categorias..." />
      )}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para gerenciar categorias."
          title="Organização indisponível"
        />
      )}

      {!isLoading &&
        organizationId &&
        !loadError &&
        categoryPage &&
        currentCategories.length === 0 && (
          <EmptyState
            description="Cadastre uma categoria para organizar o catálogo de veículos."
            title="Nenhuma categoria cadastrada."
          />
        )}

      {categoryPage && currentCategories.length > 0 && (
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <p>
              {categoryPage.total}{" "}
              {categoryPage.total === 1
                ? "categoria cadastrada"
                : "categorias cadastradas"}
            </p>
            {selectedIds.length > 0 && (
              <button
                className={styles.bulkDeleteButton}
                onClick={openBulkDeleteDialog}
                type="button"
              >
                <AiTwotoneDelete aria-hidden="true" size={14} />
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
              aria-label="Categorias de veículos da organização"
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
                      aria-label="Selecionar todas as categorias desta página"
                      checked={allVisibleSelected}
                      onChange={togglePageSelection}
                      type="checkbox"
                    />
                  </th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Descrição</th>
                  <th className={styles.actionsHeading} scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr key={category.id}>
                    <td className={styles.selectionColumn}>
                      <input
                        aria-label={`Selecionar ${category.name}`}
                        checked={selectedIds.includes(category.id)}
                        onChange={() => toggleSelection(category.id)}
                        type="checkbox"
                      />
                    </td>
                    <td>
                      <span className={styles.categoryName}>
                        {category.name}
                      </span>
                    </td>
                    <td className={styles.descriptionCell}>
                      {category.description || "—"}
                    </td>
                    <td className={styles.actions}>
                      <button
                        aria-label={`Editar ${category.name}`}
                        className={styles.iconButton}
                        onClick={() => openEditDialog(category)}
                        type="button"
                      >
                        <AiOutlineEdit aria-hidden="true" size={14} />
                      </button>
                      <button
                        aria-label={`Excluir ${category.name}`}
                        className={`${styles.iconButton} ${styles.dangerButton}`}
                        onClick={() => openDeleteDialog(category)}
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
              Página {categoryPage.page ?? page} de {pageCount}
            </span>
            <div className={styles.paginationControls}>
              <button
                aria-label="Página anterior"
                disabled={categoryPage.page <= 1 || isRefreshing}
                onClick={goToPreviousPage}
                type="button"
              >
                Anterior
              </button>
              <button
                aria-label="Próxima página"
                disabled={categoryPage.page >= pageCount || isRefreshing}
                onClick={goToNextPage}
                type="button"
              >
                Próxima
              </button>
            </div>
          </footer>
        </div>
      )}

      {categoryDialog && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="category-dialog-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            {(categoryDialog.type === "create" ||
              categoryDialog.type === "edit") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="category-dialog-heading">
                    {categoryDialog.type === "create"
                      ? "Nova categoria"
                      : "Editar categoria"}
                  </h2>
                  <p>Informe o nome e uma descrição opcional para a categoria.</p>
                </header>
                <form className={styles.form} onSubmit={submitCategory}>
                  <label>
                    Nome
                    <input
                      autoFocus
                      maxLength={80}
                      onChange={(event) =>
                        updateFormField("name", event.target.value)
                      }
                      required
                      value={form.name}
                    />
                  </label>
                  <label>
                    Descrição
                    <textarea
                      maxLength={500}
                      onChange={(event) =>
                        updateFormField("description", event.target.value)
                      }
                      rows={3}
                      value={form.description}
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
                        : categoryDialog.type === "create"
                          ? "Salvar categoria"
                          : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {(categoryDialog.type === "delete" ||
              categoryDialog.type === "bulk-delete") && (
              <>
                <header className={styles.dialogHeading}>
                  <h2 id="category-dialog-heading">
                    {categoryDialog.type === "bulk-delete"
                      ? "Excluir categorias selecionadas?"
                      : "Excluir categoria?"}
                  </h2>
                  <p>
                    {categoryDialog.type === "bulk-delete"
                      ? `${selectedIds.length} categoria(s) serão excluídas. Essa ação não pode ser desfeita.`
                      : `${categoryDialog.category.name} será excluída. Essa ação não pode ser desfeita.`}
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
                      : categoryDialog.type === "bulk-delete"
                        ? "Excluir categorias"
                        : "Excluir categoria"}
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
