import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";

export const authOptions: NextAuthOptions = {
  // MongoDB adapter still used for persisting user accounts (OAuth sign-in),
  // but session data is stored in a JWT cookie — zero DB call per request.
  adapter: MongoDBAdapter(clientPromise as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    // JWT strategy: session is a signed cookie — no DB lookup on every request.
    // This eliminates one MongoDB round-trip per Server Action call.
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // Embed user info into the JWT token at sign-in time
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: {
        email?: string | null;
        name?: string | null;
        image?: string | null;
      };
    }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    // Expose token data to the session object (read by getServerSession)
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
