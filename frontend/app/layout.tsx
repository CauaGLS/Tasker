import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { Providers } from "@/components/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tasker",
  description: "Gerencie suas atividades diárias com Tasker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="pt-BR" data-lt-installed="true" suppressHydrationWarning>
      <head>
        {/* {process.env.NODE_ENV === "development" && (
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" async></script>
        )} */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-svh flex-col overflow-hidden antialiased`}
      >
        <Providers sidebarState={sidebarState}>{children}</Providers>
      </body>
    </html>
  );
}
