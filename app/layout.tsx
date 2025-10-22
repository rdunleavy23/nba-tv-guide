import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screen Assist - NBA Games Tonight",
  description: "Find which channel NBA games are on tonight. Check national TV networks and League Pass availability with zero spoilers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
