import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className
}: SectionHeaderProps): JSX.Element {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-3",
        centered && "justify-center text-center",
        className
      )}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
