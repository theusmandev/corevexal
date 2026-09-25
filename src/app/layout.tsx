import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Manrope, Sora } from "next/font/google";
import "../styles.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const siteUrl = process.env["NEXT_PUBLIC_APP_URL"] || "https://corevexal.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Corevexal | Business Formation & Financial Solutions",
  description:
    "Corevexal helps entrepreneurs and businesses with company formation, business banking guidance, payment platform setup, and digital solutions.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Corevexal",
  url: siteUrl,
  logo: `${siteUrl}/brand/mark.svg`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${sora.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
