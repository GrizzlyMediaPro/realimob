import { SignIn } from "@clerk/nextjs";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

function safeRedirectPath(raw: string | undefined): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const sp = await searchParams;
  const afterSignInUrl = safeRedirectPath(sp.redirect_url);

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-10 px-4">
      <SignIn
        signUpUrl="/sign-up"
        afterSignInUrl={afterSignInUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
      />
    </div>
  );
}
