"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, BrainCircuit, PenTool } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/hooks/use-app";

export default function HomePage(): JSX.Element {
  const { auth } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [auth.status, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Plataforma educacional inteligente
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight md:text-6xl">
          Transforme erros de simulado em{" "}
          <span className="text-primary">diagnostico de estudo</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Fluxo completo: prova, rascunho manual, correcao automatica, analise de padroes
          e recomendacoes personalizadas.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/entrar">
              Entrar na plataforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/simulados">Ver simulados</Link>
          </Button>
        </div>
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Analise inteligente
            </CardTitle>
            <CardDescription>
              Identificacao de padroes por materia, tema e tipo de erro.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Insights claros para orientar estudo com prioridade real.
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up [animation-delay:100ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="h-5 w-5 text-primary" />
              Rascunho com canvas
            </CardTitle>
            <CardDescription>
              Resolucao manual por questao com salvamento e retomada.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Suporte a mouse e toque para contas, formulas e estrategia.
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Dashboard de evolucao
            </CardTitle>
            <CardDescription>
              Historico de tentativas, comparativo e recomendacoes acionaveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Demonstra valor do produto em poucos segundos.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
