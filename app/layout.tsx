import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "proje.tools - A toolbox of smart utilities for modern project managers",
  description: "Explore analytical tools for risk analysis, schedule evaluation, and more—built with industry standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



