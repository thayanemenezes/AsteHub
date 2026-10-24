"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AuthApi } from "../../auth/auth-api";
import { validateEmail, validatePassword } from "../../auth/auth-form";
import { Brand } from "../../components/brand";

const GENERIC_REQUEST_MESSAGE =
  "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (token) {
      if (!validatePassword(password)) {
        setError("A senha deve ter entre 12 e 128 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não correspondem.");
        return;
      }
    } else if (!validateEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setSubmitting(true);
    try {
      const api = new AuthApi();
      if (token) {
        await api.confirmPasswordReset({ token, password });
        setStatus("Sua senha foi redefinida. Você já pode entrar.");
        setPassword("");
        setConfirmPassword("");
      } else {
        const result = await api.requestPasswordReset(email.trim());
        setStatus(result.message || GENERIC_REQUEST_MESSAGE);
      }
    } catch (submitError) {
      if (submitError instanceof TypeError) {
        setError("Não foi possível conectar à API. Tente novamente.");
      } else if (token) {
        setError("Esse link é inválido ou expirou. Solicite um novo link.");
      } else {
        setError("Não foi possível enviar as instruções. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell auth-shell--single">
      <section className="auth-card" aria-labelledby="reset-password-heading">
        <Brand />
        <p className="eyebrow">ACESSO À CONTA</p>
        <h1 id="reset-password-heading">
          {token ? "Criar nova senha" : "Recuperar senha"}
        </h1>
        <p className="intro">
          {token
            ? "Escolha uma nova senha para acessar sua conta."
            : "Informe seu e-mail e enviaremos instruções para redefinir sua senha."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {token ? (
            <>
              <label htmlFor="password">Nova senha</label>
              <input
                autoComplete="new-password"
                id="password"
                maxLength={128}
                minLength={12}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <p className="field-hint">Use entre 12 e 128 caracteres.</p>

              <label htmlFor="confirmPassword">Confirme a nova senha</label>
              <input
                autoComplete="new-password"
                id="confirmPassword"
                maxLength={128}
                minLength={12}
                name="confirmPassword"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </>
          ) : (
            <>
              <label htmlFor="email">E-mail</label>
              <input
                autoComplete="email"
                id="email"
                maxLength={320}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </>
          )}

          {error && (
            <p className="form-message error-message" role="alert">
              {error}
            </p>
          )}
          {status && (
            <p className="form-message success-message" role="status">
              {status}
            </p>
          )}

          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? "Aguarde..."
              : token
                ? "Redefinir senha"
                : "Enviar instruções"}
          </button>
        </form>

        <p className="auth-switch">
          <Link href="/login">
            {status && token ? "Voltar para entrar" : "Voltar para o login"}
          </Link>
        </p>
      </section>
    </main>
  );
}
