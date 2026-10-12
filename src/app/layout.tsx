import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "@/app/providers/Providers";
import { AuthSync } from "@/components/auth/AuthSync";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internet Bachelor Game",
  description: "This is an internet dating game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body cz-shortcut-listen="true" className="min-h-full flex flex-col">
        <Providers>
          <Toaster richColors position="bottom-right" />
          <AuthSync />
          <main className=" min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
