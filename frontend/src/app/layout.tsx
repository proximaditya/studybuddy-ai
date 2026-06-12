"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>StudyBuddy AI 🎀</title>
      </head>
      <body className="antialiased font-sans bg-[#FFFDFD] text-[#5C4D53]">
        {children}
      </body>
    </html>
  );
}