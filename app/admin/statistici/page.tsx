import { Suspense } from "react";
import StatisticiPageClient from "./StatisticiPageClient";

export default function AdminStatisticiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 px-8 text-center text-gray-500">
          Se încarcă…
        </div>
      }
    >
      <StatisticiPageClient />
    </Suspense>
  );
}
