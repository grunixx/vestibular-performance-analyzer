import Link from "next/link";
import { Clock3, FileQuestion, GraduationCap } from "lucide-react";

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
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-wide text-primary">
          {quiz.examBoard} {quiz.year}
        </CardDescription>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Universidade/prova: {quiz.examBoard}
        </p>
        <p className="flex items-center gap-2">
          <FileQuestion className="h-4 w-4" />
          {quiz.questionIds.length} questoes
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Duracao estimada: {quiz.durationMinutes} min
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/simulados/${quiz.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
