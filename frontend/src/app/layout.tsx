import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PulseEdge | Clinical Triage & Scribe Command Center",
  description: "Real-time edge triage and clinical co-pilot command board for low-resource clinics and disaster response.",
  // icons: {
  //   icon: "/favicon.ico",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen overflow-hidden selection:bg-cyan-500 selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}