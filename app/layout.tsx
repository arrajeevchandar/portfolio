import type { Metadata } from "next";
import "./globals.css";
import "../components/portfolio/mindset.css";
import "../components/portfolio/project-story.css";
import "../components/portfolio/pacing.css";

export const metadata: Metadata = {
  title: "A R Rajeev Chandar | Full-Stack Developer",
  description: "A R Rajeev Chandar — full-stack developer, Adobe intern, and MCA student at CHRIST University. Explore projects in AI, mobile, and decentralized applications.",
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
