"use client";

import { Check, Palette } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  mode?: "panel" | "inline";
}

export function ThemeSwitcher({ mode = "panel" }: ThemeSwitcherProps): JSX.Element {
  const { options, theme, setTheme, mounted } = useTheme();

  if (mode === "inline") {
    return (
      <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-background/70 p-1">
        {options.map((option) => {
          const active = mounted && theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={cn(
                "relative h-7 w-7 rounded-md border transition-all",
                active
                  ? "border-primary/60 ring-2 ring-primary/30"
                  : "border-border/80 hover:border-primary/40"
              )}
              style={{
                background: `linear-gradient(135deg, ${option.swatches[0]} 0%, ${option.swatches[1]} 100%)`
              }}
              title={`${option.name} - ${option.description}`}
              aria-label={`Ativar tema ${option.name}`}
              aria-pressed={active}
            >
              {active ? (
                <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/80 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Tema visual
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = mounted && theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={cn(
                "group flex items-center justify-between rounded-lg border px-2.5 py-2 text-left transition-all duration-200",
                active
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-border/70 bg-card/70 hover:border-primary/30 hover:bg-accent/35"
              )}
              aria-pressed={active}
              aria-label={`Ativar tema ${option.name}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{option.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{option.description}</p>
              </div>
              <div className="ml-2 flex items-center gap-1.5">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: option.swatches[0] }}
                />
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: option.swatches[1] }}
                />
                {active ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
