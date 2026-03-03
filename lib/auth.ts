import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";

export const authOptions: NextAuthOptions = {
  // Pass the raw MongoDB client promise to the NextAuth MongoDB Adapter
  // so it can save users and sessions directly into our database.
  // We use `as any` because of the version mismatch between mongodb v6 / v7, which is fine structurally.
  adapter: MongoDBAdapter(clientPromise as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    // We use a database session strategy so user sessions are stored in MongoDB.
    strategy: "database",
  },
  callbacks: {
    // This callback is triggered whenever a session is checked
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
