import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Counterfactual Worlds — a lesson you can step inside",
  description: "Teachers shape a world. Students explore consequences and defend an idea with evidence.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
