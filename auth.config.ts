import type { NextAuthConfig } from "next-auth";

/**
 * Configuration shared by the Node.js runtime (`auth.ts`) and `proxy.ts`.
 * Keep this file free of database and other Node-only imports so it can be
 * evaluated before a request is routed.
 */
const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
