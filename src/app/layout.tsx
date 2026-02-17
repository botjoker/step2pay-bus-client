import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-montserrat',
});

const playfair = Playfair_Display({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: "Samba CRM",
    template: "%s | Samba CRM",
  },
  description: "Платформа для управления бизнесом",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Samba CRM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${playfair.variable} ${montserrat.className} flex flex-col min-h-screen`}>
        <Providers>
          <AuthProvider>
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
