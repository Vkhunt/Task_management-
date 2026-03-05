import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { StoreProvider } from "@/components/StoreProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TaskNova",
  description: "A modern, beautiful task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased`}
      >
        <AuthProvider>
          <StoreProvider>
            <div className="fixed inset-0 z-[-1] bg-slate-950">
              <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-[120px]" />
              <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px]" />
            </div>

            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
