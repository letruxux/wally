import type { Metadata } from "next";
import "./globals.css";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Plausible } from "@/components/plausible";
import NextTopLoader from "nextjs-toploader";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Wally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <NextTopLoader color="#eab308" height={2} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="wally"
          themes={["light", "dark", "wally"]}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </TooltipProvider>
          <Plausible />
        </ThemeProvider>
      </body>
    </html>
  );
}
