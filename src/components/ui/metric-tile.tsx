import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helper?: string;
  status?: "bom" | "atencao" | "critico";
  className?: string;
}

const statusStyles: Record<NonNullable<MetricTileProps["status"]>, string> = {
  bom: "bg-[hsl(var(--chart-2)/0.14)] text-foreground",
  atencao: "bg-[hsl(var(--chart-4)/0.16)] text-foreground",
  critico: "bg-[hsl(var(--destructive)/0.2)] text-foreground"
};

const statusLabel: Record<NonNullable<MetricTileProps["status"]>, string> = {
  bom: "Bom",
  atencao: "Atenção",
  critico: "Crítico"
};

export function MetricTile({
  label,
  value,
  icon: Icon,
  helper,
  status,
  className
}: MetricTileProps): JSX.Element {
  return (
    <Card className={cn("group overflow-hidden", className)}>
      <CardContent className="relative p-4">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition-all group-hover:scale-110" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
            {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
          </div>
          <div className="rounded-xl border border-border/80 bg-background/70 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {status ? (
          <Badge className={cn("mt-3 border-0", statusStyles[status])}>
            {statusLabel[status]}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
