import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "teal" | "neutral" | "success" | "danger" | "warning";
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  className = "",
  style,
  ...props
}: BadgeProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    border: "1px solid transparent",
  };

  // Paleta: Dark Cyan #119da4 / Cerulean #0c7489 / Dark Teal #13505b / Dust Grey #d7d9ce
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary-subtle, #e4f6f7)",
      color: "var(--color-secondary, #0c7489)",
      borderColor: "var(--color-primary-border, #a8dde0)",
    },
    secondary: {
      background: "var(--color-secondary-subtle, #ddf0f3)",
      color: "var(--color-secondary, #0c7489)",
      borderColor: "var(--color-secondary-border, #90cdd5)",
    },
    teal: {
      background: "rgba(19, 80, 91, 0.10)",
      color: "var(--color-dark-surface, #13505b)",
      borderColor: "rgba(19, 80, 91, 0.20)",
    },
    neutral: {
      background: "var(--color-surface-subtle, #f0f0ed)",
      color: "var(--color-muted, #6b6e65)",
      borderColor: "var(--color-border, #c8cac0)",
    },
    success: {
      background: "var(--color-success-subtle, #e4f6f7)",
      color: "var(--color-success, #119da4)",
      borderColor: "var(--color-primary-border, #a8dde0)",
    },
    danger: {
      background: "var(--color-danger-subtle, #fdf2f1)",
      color: "var(--color-danger, #c0392b)",
      borderColor: "rgba(192, 57, 43, 0.22)",
    },
    warning: {
      background: "var(--color-warning-subtle, #fdf5e4)",
      color: "var(--color-warning, #b07d2a)",
      borderColor: "rgba(176, 125, 42, 0.22)",
    },
  };

  return (
    <span
      className={`ui-badge ui-badge--${variant} ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
