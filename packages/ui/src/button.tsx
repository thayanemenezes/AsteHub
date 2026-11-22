import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "teal";
  size?: "sm" | "md" | "lg";
  className?: string;
  appName?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  appName,
  onClick,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 600,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 150ms ease",
    border: "1px solid transparent",
    fontFamily: "inherit",
    textDecoration: "none",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: "12px", minHeight: "32px" },
    md: { padding: "8px 16px", fontSize: "14px", minHeight: "40px" },
    lg: { padding: "12px 24px", fontSize: "16px", minHeight: "48px" },
  };

  // Paleta: Dark Cyan #119da4 / Cerulean #0c7489 / Dark Teal #13505b
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary, #119da4)",
      color: "#ffffff",
      borderColor: "transparent",
    },
    secondary: {
      background: "var(--color-secondary, #0c7489)",
      color: "#ffffff",
      borderColor: "transparent",
    },
    teal: {
      background: "var(--color-dark-surface, #13505b)",
      color: "var(--color-dark-text, #e8ebe6)",
      borderColor: "transparent",
    },
    outline: {
      background: "transparent",
      color: "var(--color-primary, #119da4)",
      borderColor: "var(--color-primary, #119da4)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-ink, #040404)",
      borderColor: "transparent",
    },
  };

  const mergedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      className={`ui-button ui-button--${variant} ${className}`}
      style={mergedStyle}
      onClick={(e) => {
        if (appName && !onClick) {
          alert(`Hello from your ${appName} app!`);
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
