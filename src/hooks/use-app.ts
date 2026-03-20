"use client";

import { useAppContext } from "@/components/providers/app-provider";

export function useApp() {
  return useAppContext();
}
