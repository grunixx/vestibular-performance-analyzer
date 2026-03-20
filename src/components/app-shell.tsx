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
  LogOut
} from "lucide-react";

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
  { href: "/historico", label: "Historico", icon: BarChart3 },
  { href: "/revisao", label: "Revisao", icon: BookOpenCheck }
];

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(196_100%_97%),_hsl(210_40%_98%))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="w-full rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-64">
          <div className="mb-6">
            <p className="text-sm font-semibold tracking-wide text-primary">SIMU.AI</p>
            <h1 className="text-lg font-bold">Diagnostico de estudo</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Transforme erro em progresso
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-lg border border-border/70 bg-background/70 p-3">
            <p className="text-sm font-medium">{auth.user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{auth.user?.email}</p>
            <div className="mt-2">
              {auth.isDemo ? <Badge variant="secondary">Modo demo</Badge> : <Badge>Conta real</Badge>}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="mt-4 w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </aside>

        <main className="min-h-[calc(100vh-2rem)] flex-1 rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
