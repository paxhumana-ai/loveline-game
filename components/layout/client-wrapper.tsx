"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
