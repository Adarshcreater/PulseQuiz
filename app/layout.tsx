import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseQuiz",
  description: "A production-ready real-time Kahoot-style quiz platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster richColors theme="dark" position="top-center" />
      </body>
    </html>
  );
}
