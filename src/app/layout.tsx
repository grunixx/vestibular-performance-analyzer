import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

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
    "MVP educacional com simulados, análise de desempenho e recomendações de estudo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${sourceSerif.variable} font-sans`}>
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
