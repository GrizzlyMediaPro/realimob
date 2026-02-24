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
        {/* Zonă safe-area top (notch / dynamic island) cu același efect de "glass" ca navbar-ul */}
        <div aria-hidden="true" className="safe-area-nav-glass" />

        {/* Gradient de fundal — dă backdrop-filter ceva de blurat pe light mode.
            Body e transparent + isolation:isolate, deci z-index:-1 e vizibil aici. */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none bg-gradient-overlay"
          style={{
            zIndex: -1,
            background: [
              "radial-gradient(circle 350px at 10% 15%, rgba(194, 90, 43, 0.18) 0%, transparent 100%)",
              "radial-gradient(circle 300px at 85% 10%, rgba(80, 40, 75, 0.15) 0%, transparent 100%)",
              "radial-gradient(circle 400px at 50% 80%, rgba(31, 45, 68, 0.16) 0%, transparent 100%)",
              "radial-gradient(circle 280px at 25% 50%, rgba(200, 150, 100, 0.14) 0%, transparent 100%)",
              "radial-gradient(circle 320px at 75% 55%, rgba(80, 120, 190, 0.12) 0%, transparent 100%)",
              "radial-gradient(circle 250px at 60% 25%, rgba(194, 90, 43, 0.10) 0%, transparent 100%)",
              "radial-gradient(circle 350px at 40% 70%, rgba(120, 80, 160, 0.10) 0%, transparent 100%)",
              "radial-gradient(circle 200px at 90% 75%, rgba(43, 120, 194, 0.08) 0%, transparent 100%)",
            ].join(", "),
          }}
        />
        {children}
      </body>
    </html>
  );
}
