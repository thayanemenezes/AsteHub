import { AuthApiError } from "./auth-api";

export function loginErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.status === 401) {
    return "E-mail ou senha inválidos.";
  }
  if (error instanceof TypeError) {
    return "Não foi possível conectar à API. Tente novamente.";
  }
  return "Não foi possível entrar. Tente novamente.";
}

export function registerErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.status === 409) {
    return "Não foi possível criar a conta com estes dados.";
  }
  if (error instanceof TypeError) {
    return "Não foi possível conectar à API. Tente novamente.";
  }
  return "Não foi possível criar a conta. Tente novamente.";
}
