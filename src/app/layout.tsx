import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: "SIMU.AI - Plataforma de Simulados Inteligentes",
  description:
    "MVP educacional com simulados, analise de desempenho e recomendacoes de estudo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${sourceSerif.variable} font-sans`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
