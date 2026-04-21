import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isApiRoute = createRouteMatcher(["/api/:path*"]);
const isPublicApiRoute = createRouteMatcher([
  "/api/public(.*)",
  "/api/settings/public",
  "/api/agents/public-performance-score",
  "/api/bnr-fx",
  "/api/uploadthing(.*)",
  "/api/cron/viewing-questionnaires",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req) && !isPublicApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Rulăm proxy-ul pentru toate rutele aplicației, dar sărim peste fișiere statice și internals Next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Și întotdeauna pentru API / trpc
    "/(api|trpc)(.*)",
  ],
};

