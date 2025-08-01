// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEARZ Vuln Report Agent",
  description: "AI-powered vulnerability reporting for bug bounty tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">{children}</div>
      </body>
    </html>
  );
}
