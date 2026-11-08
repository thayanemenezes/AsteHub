import { Injectable } from "@nestjs/common";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

@Injectable()
export class AuthEmailService {
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const link = this.createLink("/reset-password", token);
    await this.send({
      email,
      subject: "Redefinição de senha do AsteHub",
      html: `<p>Recebemos uma solicitação para redefinir sua senha do AsteHub.</p><p><a href="${link}">Criar uma nova senha</a></p><p>Este link expira em 15 minutos e só pode ser usado uma vez. Se você não solicitou a redefinição, ignore este e-mail.</p>`,
      text: `Recebemos uma solicitação para redefinir sua senha do AsteHub. Acesse ${link} para criar uma nova senha. Este link expira em 15 minutos e só pode ser usado uma vez. Se você não solicitou a redefinição, ignore este e-mail.`,
    });
  }

  async sendOrganizationInvitation(
    email: string,
    token: string,
    organizationName: string,
  ): Promise<void> {
    const link = this.createLink("/accept-invitation", token);
    const safeOrganizationName = escapeHtml(organizationName);
    const subjectOrganizationName = organizationName
      .replace(/[\r\n]/g, " ")
      .trim();
    await this.send({
      email,
      subject: `Convite para ${subjectOrganizationName} no AsteHub`,
      html: `<p>Você foi convidado para acessar a organização ${safeOrganizationName} no AsteHub.</p><p><a href="${link}">Aceitar convite</a></p><p>Este link expira em 7 dias e só pode ser usado uma vez.</p>`,
      text: `Você foi convidado para acessar a organização ${organizationName} no AsteHub. Acesse ${link} para aceitar o convite. Este link expira em 7 dias e só pode ser usado uma vez.`,
    });
  }

  private createLink(path: string, token: string): string {
    const dashboardUrl = process.env.DASHBOARD_URL?.trim();
    if (!dashboardUrl) {
      throw new Error("DASHBOARD_URL must be configured.");
    }

    const dashboard = new URL(dashboardUrl);
    if (
      process.env.NODE_ENV === "production" &&
      dashboard.protocol !== "https:"
    ) {
      throw new Error("DASHBOARD_URL must use HTTPS in production.");
    }

    const link = new URL(path, dashboard);
    link.searchParams.set("token", token);
    return link.toString();
  }

  private async send(input: {
    email: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const sender = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !sender) {
      throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [input.email],
        subject: input.subject,
        html: input.html,
        text: input.text,
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
