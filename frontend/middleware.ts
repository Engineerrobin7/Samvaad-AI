import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/translate(.*)',
  '/learn(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    // Clerk will handle authentication and redirects automatically
  }
});