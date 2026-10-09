import type { Metadata } from "next";
import { headers } from "next/headers";
import I18nProvider from "./I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Will You Go On A Date With Me? 💖",
  description: "A very special interactive date proposal invitation",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'ru';
  const subdomain = headersList.get('x-subdomain') || '';
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800&family=Nunito:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__LOCALE__ = "${locale}";
              window.__SUBDOMAIN__ = "${subdomain}";
            `,
          }}
        />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
