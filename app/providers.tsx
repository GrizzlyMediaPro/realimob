"use client";

import { CurrencyProvider } from "./contexts/CurrencyContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
