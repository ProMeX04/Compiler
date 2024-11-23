import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/globals.css";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const cascadiaMono = localFont({
  src: [
    {
      path: "./fonts/CascadiaCode.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-cascadia-mono",
});

export const metadata: Metadata = {
  title: "Compiler",
  description: "Compiler mostly like visual studio code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cascadiaMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
