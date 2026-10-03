import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import authConfig from "./auth.config";
import { findOrCreateOAuthUser } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google, GitHub],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      return Boolean(user?.email);
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await findOrCreateOAuthUser({
          email: user.email,
          displayName: user.name ?? user.email.split("@")[0],
        });
        token.userId = dbUser.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});