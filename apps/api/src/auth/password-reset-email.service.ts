import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordResetEmailService {
  async send(email: string, token: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const sender = process.env.EMAIL_FROM?.trim();
    const dashboardUrl = process.env.DASHBOARD_URL?.trim();

    if (!apiKey || !sender || !dashboardUrl) {
      throw new Error(
        "RESEND_API_KEY, EMAIL_FROM, and DASHBOARD_URL must be configured.",
      );
    }

    const dashboard = new URL(dashboardUrl);
    if (
      process.env.NODE_ENV === "production" &&
      dashboard.protocol !== "https:"
    ) {
      throw new Error("DASHBOARD_URL must use HTTPS in production.");
    }

    const resetUrl = new URL("/reset-password", dashboard);
    resetUrl.searchParams.set("token", token);
    const link = resetUrl.toString();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [email],
        subject: "Redefinição de senha do AsteHub",
        html: `<p>Recebemos uma solicitação para redefinir sua senha do AsteHub.</p><p><a href="${link}">Criar uma nova senha</a></p><p>Este link expira em 15 minutos e só pode ser usado uma vez. Se você não solicitou a redefinição, ignore este e-mail.</p>`,
        text: `Recebemos uma solicitação para redefinir sua senha do AsteHub. Acesse ${link} para criar uma nova senha. Este link expira em 15 minutos e só pode ser usado uma vez. Se você não solicitou a redefinição, ignore este e-mail.`,
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      let providerMessage: string | undefined;
      try {
        const payload: unknown = JSON.parse(responseBody);
        if (
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof payload.message === "string"
        ) {
          providerMessage = payload.message;
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          throw error;
        }
      }

      throw new Error(
        `Resend returned HTTP ${response.status}${providerMessage ? `: ${providerMessage}` : "."}`,
      );
    }
  }
}
