"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "../../components/brand";
import { validatePassword } from "../../auth/auth-form";
import { UserApi, UserApiError } from "../../users/user-api";

export function AcceptInvitationForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [acceptedEmail, setAcceptedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("O link do convite é inválido ou está incompleto.");
      return;
    }
    if (!validatePassword(password)) {
      setError("A senha deve ter entre 12 e 128 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await new UserApi().acceptInvitation({ token, password });
      setAcceptedEmail(result.email);
    } catch (submitError) {
      if (submitError instanceof UserApiError && submitError.status === 401) {
        setError("Senha incorreta para esta conta.");
      } else if (
        submitError instanceof UserApiError &&
        submitError.status === 400
      ) {
        setError("O convite é inválido ou expirou.");
      } else {
        setError("Não foi possível aceitar o convite. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section aria-labelledby="invitation-heading" className="auth-card">
        <Brand />
        <p className="eyebrow">ACESSO À EQUIPE</p>
        <h1 id="invitation-heading">
          {acceptedEmail ? "Convite aceito" : "Aceitar convite"}
        </h1>
        {acceptedEmail ? (
          <>
            <p className="intro">
              O acesso para {acceptedEmail} foi ativado. Entre para continuar.
            </p>
            <Link className="auth-submit" href="/login">
              Ir para o login
            </Link>
          </>
        ) : (
          <>
            <p className="intro">
              Defina uma senha para sua nova conta. Se você já tem uma conta
              AsteHub, informe a senha atual.
            </p>
            <form onSubmit={(event) => void handleSubmit(event)} noValidate>
              <label htmlFor="password">Senha</label>
              <input
                autoComplete="new-password"
                id="password"
                maxLength={128}
                minLength={12}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
                type="password"
                value={password}
              />
              {!token && (
                <p role="alert">
                  O link do convite é inválido ou está incompleto.
                </p>
              )}
              {error && <p role="alert">{error}</p>}
              <button
                className="auth-submit"
                disabled={submitting || !token}
                type="submit"
              >
                {submitting ? "Confirmando..." : "Aceitar convite"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
