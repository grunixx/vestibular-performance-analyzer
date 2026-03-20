import { AppShell } from "@/components/app-shell";
import type { ReactNode } from "react";

export default function PlatformLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return <AppShell>{children}</AppShell>;
}
