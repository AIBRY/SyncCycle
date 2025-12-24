import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Replaces the CSS import from main.tsx
import { Providers } from "./providers"; // Houses the QueryClient from main.tsx
import Sidebar from "@/components/Sidebar"; // Ported from your original Layout

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncCycle",
  description: "Couple productivity with BPD support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar handles its own visibility based on auth state */}
            <Sidebar /> 
            <main className="flex-1 overflow-y-auto relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}