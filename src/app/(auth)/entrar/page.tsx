"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";

import { useApp } from "@/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SignInPage(): JSX.Element {
  const { auth, signIn, enterDemoMode } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("aluno@demo.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [auth.status, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await signIn(email, password);
    setLoading(false);

    if (!response.ok) {
      setError(response.message ?? "Nao foi possivel entrar.");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border/60 bg-card/85 p-7">
          <Badge variant="secondary">MVP para portfolio</Badge>
          <h1 className="mt-4 font-serif text-4xl font-semibold">
            Plataforma de simulados com analise de desempenho real.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Login com Supabase Auth e fallback com modo demo. Ideal para apresentar em
            entrevistas, bancas e avaliacao de produto.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>Catalogo de simulados com fluxo completo de prova.</li>
            <li>Canvas de rascunho por questao com persistencia.</li>
            <li>Correcao automatica, analise de erro e recomendacoes.</li>
          </ul>
          <Button variant="ghost" asChild className="mt-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para home
            </Link>
          </Button>
        </section>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Entrar
            </CardTitle>
            <CardDescription>
              Use sua conta Supabase Auth ou acesse o modo demo para testar tudo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar com Supabase"}
              </Button>
            </form>
            <div className="rounded-lg border border-dashed border-border p-3">
              <p className="text-sm text-muted-foreground">
                Sem configurar `.env` ainda? Use o modo demo.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  enterDemoMode();
                  router.replace("/dashboard");
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Entrar em modo demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
