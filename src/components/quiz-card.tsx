import Link from "next/link";
import { ArrowRight, Clock3, FileQuestion, GraduationCap, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Quiz } from "@/types/domain";

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps): JSX.Element {
  return (
    <Card className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/12 to-transparent" />
      <CardHeader className="relative">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="outline">{quiz.examBoard}</Badge>
          <p className="text-xs font-medium text-muted-foreground">{quiz.year}</p>
        </div>
        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Universidade/prova: {quiz.examBoard}
        </p>
        <p className="flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-primary" />
          {quiz.questionIds.length} questões
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          Duração estimada: {quiz.durationMinutes} min
        </p>
      </CardContent>
      <CardFooter className="relative flex w-full gap-2">
        <Button asChild className="w-full">
          <Link href={`/simulados/${quiz.id}`}>
            Iniciar agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-background/70 px-2 py-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          IA-ready
        </div>
      </CardFooter>
    </Card>
  );
}
