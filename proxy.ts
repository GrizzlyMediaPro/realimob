import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Rulăm proxy-ul pentru toate rutele aplicației, dar sărim peste fișiere statice și internals Next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Și întotdeauna pentru API / trpc
    "/(api|trpc)(.*)",
  ],
};

