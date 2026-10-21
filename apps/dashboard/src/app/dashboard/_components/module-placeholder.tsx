import { DashboardIcon } from "./dashboard-icon";

export function DashboardModulePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="dashboard-page" aria-labelledby="module-heading">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">MÓDULO</p>
        <h1 id="module-heading">{title}</h1>
        <p>{description}</p>
      </header>

      <div className="dashboard-empty-state">
        <span className="dashboard-empty-icon">
          <DashboardIcon name="overview" />
        </span>
        <h2>Este módulo ainda está sendo preparado.</h2>
        <p>
          Assim que estiver disponível, você poderá acompanhar {title.toLowerCase()}{" "}
          por aqui.
        </p>
      </div>
    </section>
  );
}
