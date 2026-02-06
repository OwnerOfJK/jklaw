import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notes - Collaborative Workspace",
  description: "Shared notes between JK and jklaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
