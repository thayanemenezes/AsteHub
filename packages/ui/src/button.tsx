import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
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

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary, #7681B3)",
      color: "var(--color-primary-contrast, #FFFFFF)",
      borderColor: "transparent",
    },
    secondary: {
      background: "var(--color-secondary, #6F73D2)",
      color: "var(--color-secondary-contrast, #FFFFFF)",
      borderColor: "transparent",
    },
    accent: {
      background: "var(--color-accent, #83C9F4)",
      color: "var(--color-accent-contrast, #0D3352)",
      borderColor: "transparent",
    },
    outline: {
      background: "transparent",
      color: "var(--color-primary, #7681B3)",
      borderColor: "var(--color-primary, #7681B3)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-ink, #151B2E)",
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
