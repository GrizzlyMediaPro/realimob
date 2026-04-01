 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

function safePostAuthPath(raw: string | null): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isAgentSignup = role === "agent";
  const redirectAfter = safePostAuthPath(searchParams.get("redirect_url"));
  const [registrationsEnabled, setRegistrationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        const data = await res.json();
        setRegistrationsEnabled(data.registrationsEnabled !== false);
      } catch {
        setRegistrationsEnabled(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-10 px-4 text-sm text-gray-500">
        Se încarcă…
      </div>
    );
  }

  if (!registrationsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-10 px-4">
        <div
          className="max-w-md w-full rounded-2xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-6 py-8 text-center"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          <h1 className="text-xl font-semibold mb-2">Înregistrări închise</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Înregistrările noi sunt temporar dezactivate. Revino mai târziu sau
            contactează echipa dacă ai nevoie de acces.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#C25A2B] hover:underline"
          >
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-10 px-4">
      <SignUp
        signInUrl="/sign-in"
        afterSignUpUrl={
          isAgentSignup ? "/agent" : redirectAfter ?? "/"
        }
        unsafeMetadata={{
          requestedRole: isAgentSignup ? "agent" : "client",
        }}
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
      />
    </div>
  );
}
