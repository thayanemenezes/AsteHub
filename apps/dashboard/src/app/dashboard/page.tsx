"use client";

import Link from "next/link";
import { useAuth } from "../../auth/auth-provider";
import { DashboardIcon } from "./_components/dashboard-icon";

const shortcuts = [
  {
    title: "Cadastrar veículo",
    description: "Adicione veículos ao catálogo da sua locadora.",
    href: "/dashboard/vehicles",
    icon: "vehicle" as const,
  },
  {
    title: "Adicionar unidade",
    description: "Organize as filiais e pontos de atendimento.",
    href: "/dashboard/locations",
    icon: "location" as const,
  },
  {
    title: "Gerenciar site",
    description: "Acesse as configurações da presença digital.",
    href: "/dashboard/site",
    icon: "site" as const,
  },
  {
    title: "Ver leads",
    description: "Consulte os contatos recebidos pela sua empresa.",
    href: "/dashboard/leads",
    icon: "lead" as const,
  },
];

export default function DashboardHomePage() {
  const { user } = useAuth();
  const activeOrganization = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">ASTE HUB</p>
        <h1>Visão geral</h1>
        <p>Um espaço para administrar a presença digital da sua locadora.</p>
      </header>

      <section
        aria-labelledby="dashboard-welcome-heading"
        className="dashboard-welcome-card"
      >
        <div className="dashboard-welcome-copy">
          <p className="dashboard-welcome-eyebrow">BOAS-VINDAS AO ASTEHUB</p>
          <h2 id="dashboard-welcome-heading">Olá, {user?.email}</h2>
          <p>
            Gerencie a presença digital da sua empresa, seus veículos, unidades
            e oportunidades.
          </p>
          {activeOrganization && (
            <span className="dashboard-welcome-organization">
              {activeOrganization.name}
            </span>
          )}
        </div>
        <div aria-hidden="true" className="dashboard-welcome-art">
          <DashboardIcon name="overview" />
        </div>
      </section>

      <section aria-labelledby="dashboard-shortcuts-heading">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-eyebrow">PRÓXIMOS PASSOS</p>
            <h2 id="dashboard-shortcuts-heading">Ações rápidas</h2>
          </div>
          <p>Comece a estruturar o espaço da sua empresa.</p>
        </div>

        <div className="dashboard-shortcuts">
          {shortcuts.map((shortcut) => (
            <Link
              className="dashboard-shortcut-card"
              href={shortcut.href}
              key={shortcut.href}
            >
              <span className="dashboard-shortcut-icon">
                <DashboardIcon name={shortcut.icon} />
              </span>
              <span className="dashboard-shortcut-copy">
                <strong>{shortcut.title}</strong>
                <span>{shortcut.description}</span>
              </span>
              <span aria-hidden="true" className="dashboard-shortcut-arrow">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-label="Indicadores da organização"
        className="dashboard-no-indicators"
      >
        <span className="dashboard-no-indicators-mark" aria-hidden="true">
          <DashboardIcon name="overview" />
        </span>
        <p>
          Os indicadores da sua organização aparecerão aqui quando houver dados
          disponíveis.
        </p>
      </section>
    </div>
  );
}
