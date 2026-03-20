"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserCircle2
} from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useApp } from "@/hooks/use-app";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/simulados", label: "Simulados", icon: ClipboardList },
  { href: "/historico", label: "Histórico", icon: BarChart3 },
  { href: "/revisao", label: "Revisão", icon: BookOpenCheck }
];

function getPageMeta(pathname: string): {
  title: string;
  subtitle: string;
  action?: { label: string; href: string };
} {
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      subtitle: "Visão geral de desempenho e evolução de estudo.",
      action: { label: "Iniciar simulado", href: "/simulados" }
    };
  }

  if (pathname === "/simulados") {
    return {
      title: "Simulados",
      subtitle: "Escolha a prova ideal e acompanhe seu progresso por tentativa."
    };
  }

  if (pathname.includes("/simulados/") && pathname.endsWith("/tentar")) {
    return {
      title: "Simulado em andamento",
      subtitle: "Foco total na resolução da prova."
    };
  }

  if (pathname.startsWith("/simulados/")) {
    return {
      title: "Detalhes do simulado",
      subtitle: "Confira estrutura, temas e duração antes de começar.",
      action: { label: "Iniciar simulado", href: `${pathname}/tentar` }
    };
  }

  if (pathname === "/historico") {
    return {
      title: "Histórico",
      subtitle: "Compare tentativas e acompanhe sua evolução.",
      action: { label: "Ver simulados", href: "/simulados" }
    };
  }

  if (pathname === "/revisao") {
    return {
      title: "Revisão",
      subtitle: "Questões erradas, marcadas e rascunhos em um só lugar.",
      action: { label: "Abrir histórico", href: "/historico" }
    };
  }

  if (pathname.includes("/tentativas/") && pathname.endsWith("/resultado")) {
    return {
      title: "Resultado",
      subtitle: "Correção, análise e próximos passos personalizados.",
      action: { label: "Voltar ao dashboard", href: "/dashboard" }
    };
  }

  return {
    title: "SIMU.AI",
    subtitle: "Plataforma inteligente de simulados."
  };
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  const { auth, signOut } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "guest") {
      router.replace("/entrar");
    }
  }, [auth.status, router]);

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando ambiente do aluno...</p>
      </div>
    );
  }

  if (auth.status === "guest") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecionando para login...</p>
      </div>
    );
  }

  const pageMeta = getPageMeta(pathname);

  return (
    <div className="min-h-screen">
      <aside className="surface-panel fixed inset-y-0 left-0 hidden w-[264px] flex-col border-r border-sidebar-border/90 px-4 py-5 lg:flex">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            SIMU.AI
          </div>
          <h1 className="text-xl font-semibold">Diagnóstico de estudo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plataforma moderna para simulado, análise e revisão ativa.
          </p>
        </div>

        <div className="my-5 h-px bg-border/80" />

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-primary/45 bg-primary/12 text-primary shadow-[0_14px_30px_-20px_hsl(var(--primary)/0.85)]"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-accent/45 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </span>
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="my-5 h-px bg-border/80" />
          <div className="rounded-2xl border border-border/75 bg-background/75 p-3">
            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                <UserCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{auth.user?.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{auth.user?.email}</p>
              </div>
            </div>
            <div className="mt-2">
              {auth.isDemo ? (
                <Badge variant="secondary">Modo demo ativo</Badge>
              ) : (
                <Badge variant="default">Conta autenticada</Badge>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full justify-center"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da plataforma
          </Button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-border/75 bg-background/88 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{pageMeta.title}</h2>
              <p className="text-sm text-muted-foreground">{pageMeta.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher mode="inline" />
              {pageMeta.action ? (
                <Button asChild size="sm">
                  <Link href={pageMeta.action.href}>{pageMeta.action.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm",
                    active
                      ? "border-primary/40 bg-primary/12 text-primary"
                      : "border-border/70 bg-background text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="w-full px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
