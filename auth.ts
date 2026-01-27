import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return null;
        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: String(user.id), email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.userId = user.id;
        token.email = user.email;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token?.userId) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
});
