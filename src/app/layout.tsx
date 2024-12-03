import type { Metadata } from "next";
import "./styles/globals.css";
import { ClientProviders } from "./providers/ClientProviders";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Compiler Pro",
  description: "Công cụ biên dịch mạnh mẽ",
  openGraph: {
    title: "Compiler Pro",
    description: "Công cụ biên dịch mạnh mẽ",
    url: "https://compiler-pro.vercel.app",
    siteName: "Compiler Pro",
    images: [
      {
        url: "https://compiler-pro.vercel.app/og-image.jpg",
        width: 800,
        height: 600,
        alt: "Compiler Pro",
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "2dKomgBzoUewpevddI8nMraxp0s0PGodUpUcKBT82yY",
  }
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
        <meta
          name="google-site-verification"
          content="2dKomgBzoUewpevddI8nMraxp0s0PGodUpUcKBT82yY"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
        <Toaster
          position="bottom-left"
          reverseOrder={false}
          gutter={8}
          containerStyle={{
            margin: "8px",
          }}
        />
      </body>
    </html>
  );
}
