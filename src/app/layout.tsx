import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learn cloudflare next app (OpenNext)",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-auto h-screen flex flex-col">
          <div className="px-8 bg-accents-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
