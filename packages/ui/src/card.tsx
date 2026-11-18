import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "subtle" | "tinted" | "elevated";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  className = "",
  style,
  ...props
}: CardProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: "12px",
    padding: "20px",
    transition: "box-shadow 150ms ease, border-color 150ms ease",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--color-surface, #FFFFFF)",
      border: "1px solid var(--color-border, #DFE5F0)",
      boxShadow: "var(--shadow-subtle, 0 4px 20px rgba(21, 27, 46, 0.04))",
    },
    subtle: {
      background: "var(--color-surface-subtle, #F0F4FA)",
      border: "1px solid var(--color-border-subtle, #EDF1F7)",
    },
    tinted: {
      background: "var(--color-ice, #D9F0FF)",
      border: "1px solid var(--color-sky, #A3D5FF)",
    },
    elevated: {
      background: "var(--color-surface, #FFFFFF)",
      border: "1px solid var(--color-border, #DFE5F0)",
      boxShadow: "var(--shadow-card, 0 10px 30px rgba(21, 27, 46, 0.06))",
    },
  };

  return (
    <div
      className={`ui-card ui-card--${variant} ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
