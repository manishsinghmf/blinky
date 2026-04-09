import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blinky Send SOL POC",
  description: "Generate and test a Solana Send SOL blink for demos and integration planning.",
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

