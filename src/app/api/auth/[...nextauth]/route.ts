import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth incluye su propio token CSRF en el flujo de inicio de sesión.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
