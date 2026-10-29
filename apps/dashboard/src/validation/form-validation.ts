import { z, type ZodIssue } from "zod";
import { LEAD_STATUSES } from "@repo/contracts";

export type FormErrors<T extends object> = Partial<Record<keyof T, string>>;

export function formErrors<T extends object>(
  issues: readonly ZodIssue[],
): FormErrors<T> {
  const errors: FormErrors<T> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in errors)) {
      errors[field as keyof T] = issue.message;
    }
  }
  return errors;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function requiredText(minimum: number, maximum: number) {
  return z
    .string()
    .trim()
    .min(minimum, `Informe ao menos ${minimum} caracteres.`)
    .max(maximum, `Use no máximo ${maximum} caracteres.`);
}

function optionalText(minimum: number, maximum: number) {
  return z
    .string()
    .trim()
    .max(maximum, `Use no máximo ${maximum} caracteres.`)
    .refine(
      (value) => value.length === 0 || value.length >= minimum,
      `Informe ao menos ${minimum} caracteres ou deixe o campo vazio.`,
    );
}

function optionalPhone() {
  return z
    .string()
    .refine(
      (value) => value.length === 0 || /^\d{8,15}$/.test(value),
      "Informe ao menos 8 dígitos.",
    );
}

export const vehicleFormSchema = z.object({
  make: requiredText(2, 80),
  model: requiredText(2, 100),
  year: z
    .string()
    .regex(/^\d{4}$/, "O ano deve conter 4 dígitos.")
    .refine((value) => Number(value) >= 1886 && Number(value) <= 2100, {
      message: "Informe um ano entre 1886 e 2100.",
    }),
  description: optionalText(10, 1000),
});

export const vehicleCategoryFormSchema = z.object({
  name: requiredText(2, 80),
  description: optionalText(10, 500),
});

export const locationFormSchema = z.object({
  name: requiredText(2, 120),
  address: requiredText(5, 250),
  city: requiredText(2, 100),
  state: requiredText(2, 100),
  phone: optionalPhone(),
  managerName: optionalText(2, 120),
  description: optionalText(10, 500),
});

const domainPattern =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function optionalDomain() {
  return z.string().refine(
    (value) => value.length === 0 || domainPattern.test(value.toLowerCase()),
    "Informe um domínio válido.",
  );
}

function optionalColor() {
  return z
    .string()
    .refine(
      (value) => value.length === 0 || /^#[0-9a-fA-F]{6}$/.test(value),
      "Informe uma cor hexadecimal no formato #RRGGBB.",
    );
}

function optionalHttpsUrl() {
  return z.string().refine((value) => {
    if (!value) {
      return true;
    }
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Informe uma URL HTTPS válida.");
}

export const siteFormSchema = z.object({
  publicName: requiredText(2, 120),
  slug: z
    .string()
    .trim()
    .min(3, "Informe ao menos 3 caracteres.")
    .max(60, "Use no máximo 60 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens entre palavras.",
    ),
  domain: optionalDomain(),
  phone: optionalPhone(),
  description: optionalText(10, 1000),
  primaryColor: optionalColor(),
  secondaryColor: optionalColor(),
  logoUrl: optionalHttpsUrl(),
});

export const leadFormSchema = z.object({
  contactName: requiredText(2, 120),
  email: z
    .string()
    .trim()
    .max(320, "Use no máximo 320 caracteres.")
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      "Informe um e-mail válido.",
    ),
  phone: z
    .string()
    .regex(/^\d{8,15}$/, "Informe um telefone com 8 a 15 dígitos."),
  message: requiredText(10, 1000),
  status: z.enum(LEAD_STATUSES),
  vehicleId: z.string(),
  locationId: z.string(),
});
