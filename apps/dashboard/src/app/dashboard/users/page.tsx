"use client";

import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import {
  EmptyState,
  TableLoadingState,
} from "../../../components/dashboard/table-feedback";
import { PageHeading } from "../../../components/dashboard/page-heading";
import {
  isOrganizationRole,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationRole,
} from "../../../users/user-api";
import { useUsersContainer } from "./container";
import styles from "./users.module.css";

const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Membro",
};

function formattedDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function UsersPage() {
  const {
    canManage,
    closeInvite,
    confirmAction,
    confirmation,
    inviteErrors,
    inviteForm,
    inviteOpen,
    invitations,
    isLoading,
    isRefreshing,
    isSubmitting,
    isUpdatingId,
    loadError,
    members,
    openInvite,
    organizationId,
    organizationRole,
    retryLoading,
    search,
    setConfirmation,
    setSearch,
    submitInvite,
    updateInviteField,
    updateRole,
  } = useUsersContainer();
  const isOwner = organizationRole === "OWNER";

  return (
    <section
      aria-labelledby="users-heading"
      className={`dashboard-page ${styles.page}`}
    >
      <ToastContainer autoClose={4000} position="bottom-right" />
      <PageHeading
        actionDisabled={!organizationId || !canManage}
        actionIcon={<AiOutlinePlus aria-hidden="true" size={14} />}
        actionLabel="Convidar usuário"
        description="Gerencie os acessos da equipe à sua organização."
        headingId="users-heading"
        onAction={openInvite}
        search={{
          label: "Pesquisar usuários",
          placeholder: "Pesquisar por e-mail ou papel...",
          value: search,
          onChange: setSearch,
        }}
        title="Usuários"
      />

      {!canManage && organizationId && (
        <p className={styles.permissionNotice}>
          Você pode consultar a equipe, mas somente proprietários e
          administradores podem gerenciar acessos.
        </p>
      )}

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
        <TableLoadingState columns={4} label="Carregando usuários..." />
      )}

      {!isLoading && !organizationId && (
        <EmptyState
          description="Associe uma organização ativa à sua conta para gerenciar usuários."
          title="Organização indisponível"
        />
      )}

      {!isLoading && organizationId && !loadError && members.length === 0 && (
        <EmptyState
          description={
            search
              ? "Tente alterar os termos pesquisados."
              : "Convide pessoas da sua equipe para acessar a organização."
          }
          title={search ? "Nenhum usuário encontrado." : "Equipe vazia"}
        />
      )}

      {members.length > 0 && (
        <section aria-label="Membros da organização" className={styles.card}>
          <div className={styles.toolbar}>
            <p>
              {members.length} {members.length === 1 ? "membro" : "membros"}
            </p>
            {isRefreshing && <span role="status">Atualizando lista...</span>}
          </div>
          <div className={styles.tableScroll}>
            <table
              aria-label="Usuários da organização"
              className={styles.table}
            >
              <thead>
                <tr>
                  <th scope="col">E-mail</th>
                  <th scope="col">Papel</th>
                  <th scope="col">Status</th>
                  <th scope="col">Desde</th>
                  <th className={styles.actionsHeading} scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className={styles.email}>{member.email}</td>
                    <td>
                      <select
                        aria-label={`Papel de ${member.email}`}
                        disabled={
                          !canManage ||
                          (member.role === "OWNER" &&
                            !isOwner &&
                            member.status === "ACTIVE") ||
                          isUpdatingId === member.id
                        }
                        onChange={(event) => {
                          const role = event.currentTarget.value;
                          if (isOrganizationRole(role)) {
                            void updateRole(member, role);
                          }
                        }}
                        value={member.role}
                      >
                        {(["OWNER", "ADMIN", "MEMBER"] as const)
                          .filter(
                            (role) =>
                              role !== "OWNER" ||
                              inviteForm.role === "OWNER" ||
                              member.role === "OWNER",
                          )
                          .map((role) => (
                            <option key={role} value={role}>
                              {roleLabels[role]}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <span
                        className={
                          member.status === "ACTIVE"
                            ? styles.activeStatus
                            : styles.suspendedStatus
                        }
                      >
                        {member.status === "ACTIVE" ? "Ativo" : "Suspenso"}
                      </span>
                    </td>
                    <td>{formattedDate(member.createdAt)}</td>
                    <td className={styles.actions}>
                      <button
                        aria-label={`Remover ${member.email}`}
                        className={styles.dangerButton}
                        disabled={
                          !canManage || (member.role === "OWNER" && !isOwner)
                        }
                        onClick={() =>
                          setConfirmation({ type: "remove-member", member })
                        }
                        type="button"
                      >
                        <AiOutlineDelete aria-hidden="true" size={15} />
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {invitations.length > 0 && (
        <section aria-label="Convites pendentes" className={styles.card}>
          <div className={styles.toolbar}>
            <h2>Convites pendentes</h2>
            <p>{invitations.length}</p>
          </div>
          <div className={styles.tableScroll}>
            <table aria-label="Convites pendentes" className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">E-mail</th>
                  <th scope="col">Papel</th>
                  <th scope="col">Expira em</th>
                  <th className={styles.actionsHeading} scope="col">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className={styles.email}>{invitation.email}</td>
                    <td>{roleLabels[invitation.role]}</td>
                    <td>{formattedDate(invitation.expiresAt)}</td>
                    <td className={styles.actions}>
                      <button
                        aria-label={`Cancelar convite para ${invitation.email}`}
                        className={styles.dangerButton}
                        disabled={!canManage}
                        onClick={() =>
                          setConfirmation({
                            type: "revoke-invitation",
                            invitation,
                          })
                        }
                        type="button"
                      >
                        <AiOutlineDelete aria-hidden="true" size={15} />
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {inviteOpen && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="invite-dialog-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <header className={styles.dialogHeading}>
              <h2 id="invite-dialog-heading">Convidar usuário</h2>
              <button onClick={closeInvite} type="button">
                Fechar
              </button>
            </header>
            <form onSubmit={(event) => void submitInvite(event)}>
              <label className={styles.field}>
                E-mail
                <input
                  autoComplete="email"
                  maxLength={320}
                  onChange={(event) =>
                    updateInviteField("email", event.currentTarget.value)
                  }
                  required
                  type="email"
                  value={inviteForm.email}
                />
                {inviteErrors.email && (
                  <span className={styles.fieldError}>
                    {inviteErrors.email}
                  </span>
                )}
              </label>
              <label className={styles.field}>
                Papel
                <select
                  onChange={(event) =>
                    isOrganizationRole(event.currentTarget.value) &&
                    updateInviteField("role", event.currentTarget.value)
                  }
                  value={inviteForm.role}
                >
                  {isOwner && <option value="OWNER">{roleLabels.OWNER}</option>}
                  <option value="ADMIN">{roleLabels.ADMIN}</option>
                  <option value="MEMBER">{roleLabels.MEMBER}</option>
                </select>
              </label>
              <p className={styles.inviteHint}>
                O convite expira em 7 dias. A pessoa poderá definir uma nova
                senha ou usar a senha da conta que já possui.
              </p>
              <footer className={styles.dialogActions}>
                <button onClick={closeInvite} type="button">
                  Cancelar
                </button>
                <button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando..." : "Enviar convite"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {confirmation && (
        <div className={styles.dialogBackdrop}>
          <section
            aria-labelledby="confirmation-heading"
            aria-modal="true"
            className={styles.dialog}
            role="dialog"
          >
            <h2 id="confirmation-heading">
              {confirmation.type === "remove-member"
                ? "Remover acesso"
                : "Cancelar convite"}
            </h2>
            <p>
              {confirmation.type === "remove-member"
                ? `Remover ${confirmation.member.email} da organização?`
                : `Cancelar o convite enviado para ${confirmation.invitation.email}?`}
            </p>
            <footer className={styles.dialogActions}>
              <button
                disabled={isSubmitting}
                onClick={() => setConfirmation(null)}
                type="button"
              >
                Voltar
              </button>
              <button
                className={styles.confirmDanger}
                disabled={isSubmitting}
                onClick={() => void confirmAction()}
                type="button"
              >
                {isSubmitting
                  ? "Processando..."
                  : confirmation.type === "remove-member"
                    ? "Remover acesso"
                    : "Cancelar convite"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
