import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";
import { rateLimit, clientIp } from "./rate-limit";

export const oauthProviders = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  facebook: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
};

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(credentials, req) {
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      const ip = clientIp(req?.headers as Record<string, unknown> | undefined);

      // Fuerza bruta: 5 intentos por minuto por IP y por cuenta
      const byIp = rateLimit(`login:ip:${ip}`);
      const byEmail = rateLimit(`login:email:${email}`);
      if (!byIp.ok || !byEmail.ok) throw new Error("RATE_LIMIT");

      if (!email || !password || password.length > 128) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      // Comparación siempre (aunque no exista el usuario) para no filtrar cuentas por tiempo de respuesta
      const hash = user?.passwordHash ?? "$2a$12$JBsU./nm7S4g84/b/ORAg.02KWcZDhzjgKQek5wPBpOxLHdl2W4Cy";
      const valid = await verifyPassword(password, hash);
      if (!user || !user.passwordHash || !valid) return null;
      if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  }),
];

if (oauthProviders.google) {
  providers.push(
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  );
}
if (oauthProviders.facebook) {
  providers.push(
    FacebookProvider({ clientId: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 horas
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        const email = user.email?.toLowerCase();
        if (!email) return "/login?error=NoEmail";
        await prisma.user.upsert({
          where: { email },
          update: { emailVerified: new Date(), image: user.image ?? undefined },
          create: {
            email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            provider: account.provider,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Al iniciar sesión, carga id y rol desde la base de datos (nunca desde el cliente)
      if (user?.email) {
        const db = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (db) {
          token.uid = db.id;
          token.role = db.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as string) ?? "CLIENT";
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireAdmin() {
  const s = await getSession();
  if (!s?.user?.id || s.user.role !== "ADMIN") return null;
  // Revalida el rol contra la BD (por si fue revocado)
  const u = await prisma.user.findUnique({ where: { id: s.user.id }, select: { role: true } });
  return u?.role === "ADMIN" ? s : null;
}
