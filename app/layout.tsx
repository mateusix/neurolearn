import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const font = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "NeuroLearn | Minha trilha",
  description: "Um passo de cada vez na descoberta das letras e dos sons.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
    <html
      lang="pt-BR"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        font.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
    </ClerkProvider>
  );
}
