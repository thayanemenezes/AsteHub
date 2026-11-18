import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "sky" | "ice" | "neutral" | "success" | "danger";
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

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary-subtle, #EEF2FA)",
      color: "var(--color-primary, #7681B3)",
      borderColor: "var(--color-primary-border, #CCD3E8)",
    },
    secondary: {
      background: "var(--color-secondary-subtle, #EEF0FB)",
      color: "var(--color-secondary, #6F73D2)",
      borderColor: "var(--color-secondary-border, #CAD0F3)",
    },
    accent: {
      background: "var(--color-accent-subtle, #E8F5FD)",
      color: "#0F4466",
      borderColor: "var(--color-accent-border, #BCE2FA)",
    },
    sky: {
      background: "var(--color-sky-subtle, #F0F7FF)",
      color: "#123B63",
      borderColor: "var(--color-sky-border, #CCE5FF)",
    },
    ice: {
      background: "var(--color-ice, #D9F0FF)",
      color: "#16365C",
      borderColor: "var(--color-ice-border, #BEE3FC)",
    },
    neutral: {
      background: "var(--color-surface-subtle, #F0F4FA)",
      color: "var(--color-muted, #586380)",
      borderColor: "var(--color-border, #DFE5F0)",
    },
    success: {
      background: "var(--color-success-subtle, #EFFBF5)",
      color: "var(--color-success, #1E8E63)",
      borderColor: "rgba(30, 142, 99, 0.2)",
    },
    danger: {
      background: "var(--color-danger-subtle, #FDF2F2)",
      color: "var(--color-danger, #D9383A)",
      borderColor: "rgba(217, 56, 58, 0.2)",
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
