import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AlmostCrackd Caption App",
  description: "Upload images and rate captions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <nav
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid #ddd",
            display: "flex",
            gap: "20px",
            fontWeight: "500"
          }}
        >
          <a href="/">Home</a>
          <a href="/list">Captions</a>
          <a href="/upload">Upload</a>
        </nav>
        <div 
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "2rem"
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
