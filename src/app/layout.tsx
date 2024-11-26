import type { Metadata } from "next";
import "./styles/globals.css";
import { ClientProviders } from "./providers/ClientProviders";

export const metadata: Metadata = {
  title: "Compiler",
  description: "Compiler mostly like visual studio code",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
