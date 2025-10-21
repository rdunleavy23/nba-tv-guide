import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScreenAssist - NBA Games Tonight",
  description: "Find which channel NBA games are on tonight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const settings = localStorage.getItem('screenassist-settings');
                if (settings) {
                  const parsed = JSON.parse(settings);
                  if (parsed.state?.favoriteTeam) {
                    // Set accent color based on favorite team
                    document.documentElement.style.setProperty('--accent', '#E31837');
                  }
                }
              } catch (e) {
                // Ignore localStorage errors during SSR
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
