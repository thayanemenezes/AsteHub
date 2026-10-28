import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "../auth/auth-provider";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsteHub | Acesso",
  description: "Acesse sua conta AsteHub.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
