import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  
  providers: [
    // 🔐 Google (якщо використовуєш)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔐 Credentials (якщо був логін по email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // ⚠️ якщо раніше була перевірка пароля — вона була тут
        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  
callbacks: {
    async jwt({ token, user }) {
      // user з'являється тут ТІЛЬКИ в момент першого входу
      if (user) {
        console.log("JWT CALLBACK - USER ID FOUND:", user.id);
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        console.log("SESSION CALLBACK - SETTING ID:", session.user.id);
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};


export const auth = () => getServerSession(authOptions);