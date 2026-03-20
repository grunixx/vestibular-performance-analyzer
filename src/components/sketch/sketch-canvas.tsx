"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Eraser, PenLine, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SketchCanvasProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  className?: string;
}

type Tool = "pen" | "eraser";

export const SketchCanvas = memo(function SketchCanvas({
  initialDataUrl,
  onSave,
  className
}: SketchCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2.5);
  const [hint, setHint] = useState<string>("Toque e arraste para desenhar.");

  function getContext(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  const setupCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(ratio, ratio);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = "#0f172a";
  }, []);

  useEffect(() => {
    setupCanvas();

    if (initialDataUrl) {
      const image = new Image();
      image.onload = () => {
        const context = getContext();
        const canvas = canvasRef.current;
        if (!context || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        context.clearRect(0, 0, rect.width, rect.height);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, rect.width, rect.height);
        context.drawImage(image, 0, 0, rect.width, rect.height);
      };
      image.src = initialDataUrl;
    }
  }, [initialDataUrl, setupCanvas]);

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>): {
    x: number;
    y: number;
  } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>): void {
    const context = getContext();
    if (!context) return;

    const { x, y } = pointerPosition(event);
    context.beginPath();
    context.moveTo(x, y);
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.lineWidth = tool === "eraser" ? Math.max(brushSize * 4.6, 12) : brushSize;
    context.strokeStyle = "#0f172a";
    setIsDrawing(true);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>): void {
    if (!isDrawing) return;
    const context = getContext();
    if (!context) return;
    const { x, y } = pointerPosition(event);
    context.lineTo(x, y);
    context.stroke();
  }

  function stopDrawing(): void {
    const context = getContext();
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  }

  function clearCanvas(): void {
    const context = getContext();
    const canvas = canvasRef.current;
    if (!context || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
    setHint("Canvas limpo. Continue seu rascunho.");
    window.setTimeout(() => setHint("Toque e arraste para desenhar."), 1600);
  }

  function handleSave(): void {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png", 1));
    setHint("Rascunho salvo localmente.");
    window.setTimeout(() => setHint("Toque e arraste para desenhar."), 1600);
  }

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={tool === "pen" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("pen")}
        >
          <PenLine className="mr-2 h-4 w-4" />
          Caneta
        </Button>
        <Button
          type="button"
          variant={tool === "eraser" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("eraser")}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Borracha
        </Button>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/70 p-1">
          {[2, 3, 4].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBrushSize(size)}
              className={cn(
                "h-7 rounded-md px-2 text-xs transition-colors",
                brushSize === size
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/60"
              )}
            >
              {size}px
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={clearCanvas}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar rascunho
        </Button>
      </div>

      <div className="rounded-2xl border border-border/75 bg-gradient-to-b from-card via-card to-background p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="outline">Workspace</Badge>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-white p-2 shadow-inner">
          <canvas
            ref={canvasRef}
            className="h-[280px] w-full touch-none rounded-lg bg-white"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
});
