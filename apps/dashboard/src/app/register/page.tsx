"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "../../components/brand";
import { registerErrorMessage } from "../../auth/auth-error-message";
import { useAuth } from "../../auth/auth-provider";
import {
  validateEmail,
  validateOrganizationName,
  validatePassword,
} from "../../auth/auth-form";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateOrganizationName(organizationName)) {
      setError("O nome da organização deve ter entre 2 e 120 caracteres.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!validatePassword(password)) {
      setError("A senha deve ter entre 12 e 128 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        organizationName: organizationName.trim(),
      });
      router.push("/dashboard");
    } catch (submitError) {
      setError(registerErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="register-heading">
        <Brand />
        <p className="eyebrow">COMECE POR AQUI</p>
        <h1 id="register-heading">Crie sua conta</h1>
        <p className="intro">
          Cadastre seu acesso e a organização que você administra.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="organizationName">Nome da organização</label>
          <input
            autoComplete="organization"
            id="organizationName"
            maxLength={120}
            minLength={2}
            name="organizationName"
            onChange={(event) => setOrganizationName(event.target.value)}
            required
            type="text"
            value={organizationName}
          />

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

          <label htmlFor="password">Senha</label>
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

          {error && (
            <p className="form-message error-message" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-switch">
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </p>
      </section>
      <aside className="auth-aside" aria-label="Sobre o AsteHub">
        <div className="aside-orbit orbit-one" />
        <div className="aside-orbit orbit-two" />
        <p className="eyebrow">GESTÃO QUE MOVE</p>
        <h2>
          Uma nova
          <br />
          jornada começa.
        </h2>
        <p>Crie seu espaço e traga sua equipe para perto.</p>
        <span className="aside-footnote">ASTE HUB · MOBILIDADE</span>
      </aside>
    </main>
  );
}
