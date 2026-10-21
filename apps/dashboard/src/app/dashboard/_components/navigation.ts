export type DashboardIconName =
  | "overview"
  | "vehicle"
  | "category"
  | "location"
  | "site"
  | "lead"
  | "users"
  | "settings";

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: DashboardIconName;
}

export const primaryNavigation: DashboardNavigationItem[] = [
  { label: "Visão geral", href: "/dashboard", icon: "overview" },
  { label: "Veículos", href: "/dashboard/vehicles", icon: "vehicle" },
  { label: "Categorias", href: "/dashboard/categories", icon: "category" },
  { label: "Unidades", href: "/dashboard/locations", icon: "location" },
  { label: "Site", href: "/dashboard/site", icon: "site" },
  { label: "Leads", href: "/dashboard/leads", icon: "lead" },
];

export const administrationNavigation: DashboardNavigationItem[] = [
  { label: "Usuários", href: "/dashboard/users", icon: "users" },
  { label: "Configurações", href: "/dashboard/settings", icon: "settings" },
];
