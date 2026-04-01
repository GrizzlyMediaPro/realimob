import { Suspense } from "react";
import SetariPageClient from "./SetariPageClient";

export default function AdminSetariPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 px-8 text-center text-gray-500">
          Se încarcă…
        </div>
      }
    >
      <SetariPageClient />
    </Suspense>
  );
}
