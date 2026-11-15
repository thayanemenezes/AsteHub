"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand } from "../../components/brand";
import { useAuth } from "../../auth/auth-provider";
import { DashboardIcon } from "./_components/dashboard-icon";
import {
  administrationNavigation,
  primaryNavigation,
} from "./_components/navigation";

function isActiveRoute(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/dashboard";
  const router = useRouter();
  const { status, user, logout, retry } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuSource, setAccountMenuSource] = useState<
    "sidebar" | "navbar" | null
  >(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstNavigationLinkRef = useRef<HTMLAnchorElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const navbarAccountMenuRef = useRef<HTMLDivElement>(null);
  const navbarAccountMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuOpen = accountMenuSource !== null;
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const activeOrganization = user?.organizations?.find(
    (organization) => organization.status === "ACTIVE",
  );
  const currentPage = [...primaryNavigation, ...administrationNavigation].find(
    (item) => isActiveRoute(pathname, item.href),
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      firstNavigationLinkRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target) &&
        !navbarAccountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuSource(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuSource(null);
        if (accountMenuSource === "navbar") {
          navbarAccountMenuTriggerRef.current?.focus();
        } else {
          accountMenuTriggerRef.current?.focus();
        }
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen, accountMenuSource]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    menuToggleRef.current?.focus();
  }

  async function handleLogout() {
    setLogoutError("");
    setLoggingOut(true);
    try {
      await logout();
      setAccountMenuSource(null);
      router.push("/login");
    } catch {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setLoggingOut(false);
    }
  }

  function renderAccountDropdown() {
    return (
      <div
        aria-label="Ações da conta"
        className="dashboard-account-dropdown"
        id="dashboard-account-actions"
        role="group"
      >
        {logoutError && (
          <p className="dashboard-logout-error" role="alert">
            {logoutError}
          </p>
        )}
        <Link
          className="dashboard-profile-link"
          href="/dashboard/profile"
          onClick={() => setAccountMenuSource(null)}
        >
          Perfil
        </Link>
        <button
          className="dashboard-logout-button"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          type="button"
        >
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    );
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="dashboard-auth-state">
        <p role="status">Carregando sua sessão...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="dashboard-auth-state">
        <section className="dashboard-auth-error" aria-labelledby="session-error">
          <h1 id="session-error">Não foi possível verificar sua sessão</h1>
          <p role="alert">
            Confira sua conexão e tente carregar sua sessão novamente.
          </p>
          <button
            className="dashboard-primary-button"
            onClick={() => void retry()}
            type="button"
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          className="dashboard-backdrop is-visible"
          onClick={closeMobileMenu}
        />
      )}
      <aside
        className={`dashboard-sidebar${mobileMenuOpen ? " is-open" : ""}`}
      >
        <div className="dashboard-sidebar-brand">
          <Brand href="/dashboard" src="/logo-white.png" />
        </div>

        <div className="dashboard-organization">
          <span className="dashboard-organization-mark" aria-hidden="true">
            {activeOrganization?.name.charAt(0).toUpperCase() ?? "A"}
          </span>
          <span className="dashboard-organization-copy">
            <span className="dashboard-organization-label">ORGANIZAÇÃO</span>
            <span className="dashboard-organization-name">
              {activeOrganization?.name ?? "Nenhuma organização ativa"}
            </span>
          </span>
        </div>

        <nav
          aria-label="Navegação principal"
          className="dashboard-navigation"
          id="dashboard-navigation"
        >
          <p className="dashboard-navigation-label">PRINCIPAL</p>
          <ul>
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={
                    isActiveRoute(pathname, item.href) ? "page" : undefined
                  }
                  className="dashboard-navigation-link"
                  href={item.href}
                  onClick={closeMobileMenu}
                  ref={item.href === "/dashboard" ? firstNavigationLinkRef : undefined}
                >
                  <DashboardIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="dashboard-navigation-label dashboard-administration-label">
            ADMINISTRAÇÃO
          </p>
          <ul>
            {administrationNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={
                    isActiveRoute(pathname, item.href) ? "page" : undefined
                  }
                  className="dashboard-navigation-link"
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DashboardIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div
            className="dashboard-account-menu"
            onBlurCapture={(event) => {
              const nextFocusedElement = event.relatedTarget;
              if (
                !(nextFocusedElement instanceof Node) ||
                !event.currentTarget.contains(nextFocusedElement)
              ) {
                setAccountMenuSource(null);
              }
            }}
            ref={accountMenuRef}
          >
            {accountMenuSource === "sidebar" && renderAccountDropdown()}
            <button
              aria-controls={
                accountMenuSource === "sidebar"
                  ? "dashboard-account-actions"
                  : undefined
              }
              aria-expanded={accountMenuSource === "sidebar"}
              aria-label={`Ações da conta de ${user.email}`}
              className="dashboard-account-trigger"
              onClick={() =>
                setAccountMenuSource((current) =>
                  current === "sidebar" ? null : "sidebar",
                )
              }
              ref={accountMenuTriggerRef}
              type="button"
            >
              <span className="dashboard-avatar" aria-hidden="true">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <span className="dashboard-user-copy">
                <span className="dashboard-user-email">{user.email}</span>
                <span className="dashboard-user-role">
                  {activeOrganization?.role ?? "Conta AsteHub"}
                </span>
              </span>
              <svg
                aria-hidden="true"
                className="dashboard-account-chevron"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="dashboard-main-column">
        <header className="dashboard-topbar">
          <button
            aria-controls="dashboard-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="dashboard-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            ref={menuToggleRef}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dashboard-breadcrumb">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>
              {currentPage?.label ??
                (pathname === "/dashboard/profile" ? "Perfil" : "Visão geral")}
            </strong>
          </div>
          <div
            className="dashboard-account-menu dashboard-topbar-account-menu"
            onBlurCapture={(event) => {
              const nextFocusedElement = event.relatedTarget;
              if (
                !(nextFocusedElement instanceof Node) ||
                !event.currentTarget.contains(nextFocusedElement)
              ) {
                setAccountMenuSource(null);
              }
            }}
            ref={navbarAccountMenuRef}
          >
            {accountMenuSource === "navbar" && renderAccountDropdown()}
            <button
              aria-controls={
                accountMenuSource === "navbar"
                  ? "dashboard-account-actions"
                  : undefined
              }
              aria-expanded={accountMenuSource === "navbar"}
              aria-label={`Menu de perfil de ${user.email}`}
              className="dashboard-account-trigger dashboard-topbar-user"
              onClick={() =>
                setAccountMenuSource((current) =>
                  current === "navbar" ? null : "navbar",
                )
              }
              ref={navbarAccountMenuTriggerRef}
              type="button"
            >
              <span className="dashboard-avatar" aria-hidden="true">
                {(user.name?.trim().charAt(0) || user.email.charAt(0)).toUpperCase()}
              </span>
              <span className="dashboard-topbar-user-email">{user.email}</span>
              <svg
                aria-hidden="true"
                className="dashboard-account-chevron"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
