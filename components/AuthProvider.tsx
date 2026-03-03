"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider is a Client Component wrapper.
 * We must wrap our Next.js App Router application in this Provider
 * so that any Client Component can access the user's current session
 * using the `useSession()` hook!
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
