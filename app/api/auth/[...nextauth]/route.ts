import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * This file creates the Next.js API Routes for NextAuth.
 * It automatically handles routes like:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 *
 * We pass the authOptions defined in lib/auth.ts to configure it.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
