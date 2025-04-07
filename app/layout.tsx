import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gourmet Delights Restaurant",
  description: "Order delicious food and get personalized recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-full bg-background font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold">Gourmet Delights</span>
                </a>
              </div>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <a href="/menu" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Menu
                </a>
                <a href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  About
                </a>
                <a href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Contact
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built with ❤️ by{" "}
                <a href="/" className="font-medium underline underline-offset-4">
                  Gourmet Delights
                </a>
                . All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
