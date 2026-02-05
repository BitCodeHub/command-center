import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Command Center - Lumen AI Solutions",
  description: "Real-time operations dashboard for Lumen AI Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
