"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../auth/auth-provider";
import { useAsyncResource } from "../../../hooks/use-async-resource";
import {
  formErrors,
  organizationInvitationFormSchema,
  type FormErrors,
} from "../../../validation/form-validation";
import {
  UserApi,
  UserApiError,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationRole,
} from "../../../users/user-api";

interface InvitationForm {
  email: string;
  role: OrganizationRole;
}

type Confirmation =
  | { type: "remove-member"; member: OrganizationMember }
  | { type: "revoke-invitation"; invitation: OrganizationInvitation }
  | null;

const emptyInvitationForm: InvitationForm = { email: "", role: "MEMBER" };

function requestError(error: unknown, fallback: string): string {
  if (error instanceof UserApiError && error.status === 403) {
    return "Você não tem permissão para gerenciar usuários desta organização.";
  }
  if (error instanceof UserApiError && error.status === 404) {
    return "O acesso não foi encontrado. Atualize a lista e tente novamente.";
  }
  if (error instanceof UserApiError && error.status === 409) {
    return "A operação não pode ser concluída. Verifique os acessos e tente novamente.";
  }
  if (error instanceof UserApiError && error.status === 503) {
    return "Não foi possível enviar o convite. Tente novamente mais tarde.";
  }
  return fallback;
}

export function useUsersContainer() {
  const { user } = useAuth();
  const organization = user?.organizations?.find(
    (item) => item.status === "ACTIVE",
  );
  const organizationId = organization?.id ?? null;
  const canManage =
    organization?.role === "OWNER" || organization?.role === "ADMIN";
  const organizationRole = organization?.role;
  const api = useMemo(() => new UserApi(), []);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] =
    useState<InvitationForm>(emptyInvitationForm);
  const [inviteErrors, setInviteErrors] = useState<FormErrors<InvitationForm>>(
    {},
  );
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(
    (signal: AbortSignal) => {
      if (!organizationId) {
        return Promise.reject(new Error("An active organization is required."));
      }
      return api.list(organizationId, signal);
    },
    [api, organizationId],
  );
  const resource = useAsyncResource(organizationId, loadUsers);
  const members = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allMembers = resource.data?.members ?? [];
    return query
      ? allMembers.filter((member) =>
          `${member.email} ${member.role} ${member.status}`
            .toLowerCase()
            .includes(query),
        )
      : allMembers;
  }, [resource.data?.members, search]);
  const invitations = useMemo(() => {
    const query = search.trim().toLowerCase();
    const allInvitations = resource.data?.invitations ?? [];
    return query
      ? allInvitations.filter((invitation) =>
          `${invitation.email} ${invitation.role}`
            .toLowerCase()
            .includes(query),
        )
      : allInvitations;
  }, [resource.data?.invitations, search]);
  const loadError = resource.error
    ? requestError(resource.error, "Não foi possível carregar os usuários.")
    : !organizationId && resource.status === "idle"
      ? "Não há uma organização ativa para carregar os usuários."
      : "";

  function openInvite() {
    setInviteForm(emptyInvitationForm);
    setInviteErrors({});
    setInviteOpen(true);
  }

  function closeInvite() {
    setInviteOpen(false);
    setInviteErrors({});
  }

  function updateInviteField(
    field: keyof InvitationForm,
    value: string | OrganizationRole,
  ) {
    setInviteForm((current) => ({ ...current, [field]: value }));
    setInviteErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = organizationInvitationFormSchema.safeParse(inviteForm);
    if (!parsed.success) {
      setInviteErrors(formErrors<InvitationForm>(parsed.error.issues));
      return;
    }
    if (!organizationId) return;

    setIsSubmitting(true);
    try {
      await api.invite(organizationId, parsed.data);
      toast.success("Convite enviado com sucesso.");
      closeInvite();
      setInviteForm(emptyInvitationForm);
      resource.retry();
    } catch (error) {
      toast.error(
        requestError(
          error,
          "Não foi possível enviar o convite. Tente novamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateRole(
    member: OrganizationMember,
    role: OrganizationRole,
  ) {
    if (!organizationId || role === member.role) return;
    setIsUpdatingId(member.id);
    try {
      await api.updateMember(organizationId, member.id, role);
      toast.success("Papel do usuário atualizado.");
      resource.retry();
    } catch (error) {
      toast.error(
        requestError(error, "Não foi possível atualizar o papel do usuário."),
      );
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function confirmAction() {
    if (!organizationId || !confirmation) return;
    setIsSubmitting(true);
    try {
      if (confirmation.type === "remove-member") {
        await api.removeMember(organizationId, confirmation.member.id);
        toast.success("Acesso removido com sucesso.");
      } else {
        await api.revokeInvitation(organizationId, confirmation.invitation.id);
        toast.success("Convite cancelado.");
      }
      setConfirmation(null);
      resource.retry();
    } catch (error) {
      toast.error(requestError(error, "Não foi possível concluir a operação."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    canManage,
    closeInvite,
    confirmAction,
    confirmation,
    inviteErrors,
    inviteForm,
    inviteOpen,
    invitations,
    isLoading: resource.isLoading,
    isRefreshing: resource.isRefreshing,
    isSubmitting,
    isUpdatingId,
    loadError,
    members,
    openInvite,
    organizationId,
    organizationRole,
    retryLoading: resource.retry,
    search,
    setConfirmation,
    setSearch,
    submitInvite,
    updateInviteField,
    updateRole,
  };
}
