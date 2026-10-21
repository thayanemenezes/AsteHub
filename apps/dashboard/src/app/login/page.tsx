"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "../../components/brand";
import { useAuth } from "../../auth/auth-provider";
import { loginErrorMessage } from "../../auth/auth-error-message";
import { validateEmail, validatePassword } from "../../auth/auth-form";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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
      await login({ email: email.trim(), password });
      router.push("/dashboard");
    } catch (submitError) {
      setError(loginErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-heading">
        <Brand />
        <p className="eyebrow">BEM-VINDO DE VOLTA</p>
        <h1 id="login-heading">Entrar no AsteHub</h1>
        <p className="intro">Acesse sua conta para continuar de onde parou.</p>

        <form onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            id="password"
            maxLength={128}
            minLength={12}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

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
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          Ainda não tem uma conta? <Link href="/register">Criar conta</Link>
        </p>
      </section>
      <aside className="auth-aside" aria-label="Sobre o AsteHub">
        <div className="aside-orbit orbit-one" />
        <div className="aside-orbit orbit-two" />
        <p className="eyebrow">GESTÃO QUE MOVE</p>
        <h2>
          Seu negócio,
          <br />
          em movimento.
        </h2>
        <p>Um espaço simples para você e sua equipe.</p>
        <span className="aside-footnote">ASTE HUB · MOBILIDADE</span>
      </aside>
    </main>
  );
}
