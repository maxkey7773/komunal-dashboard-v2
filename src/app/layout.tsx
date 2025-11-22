import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kommunal Dashboard",
  description: "Kommunal to'lovlar va harajatlar boshqaruvi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
