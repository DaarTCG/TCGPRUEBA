import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Hoenn TCG · Pokémon TCG en Chile", template: "%s · Hoenn TCG" },
  description: "Tienda de Pokémon TCG: singles, sellados y cartas graduadas. Compramos tu colección.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Leer headers fuerza render dinámico: Next aplica el nonce de la CSP a sus scripts
  (await headers()).get("x-nonce");
  return (
    <html lang="es-CL">
      <body className="min-h-screen font-sans">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
