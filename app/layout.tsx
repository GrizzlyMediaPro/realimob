import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const kurskMedium = localFont({
  src: "../public/fonts/Kursk105-Medium.otf",
  variable: "--font-kursk-medium",
  display: "swap",
});

const galakThin = localFont({
  src: "../public/fonts/GalakPro-Thin.otf",
  variable: "--font-galak-thin",
  display: "swap",
});

const galakRegular = localFont({
  src: "../public/fonts/GalakPro-Regular.otf",
  variable: "--font-galak-regular",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Realimob",
  description: "Realimob - platformă imobiliară",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${kurskMedium.variable} ${galakThin.variable} ${galakRegular.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
