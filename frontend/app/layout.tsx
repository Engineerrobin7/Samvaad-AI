import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Logo } from '@/components/ui/logo'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from "@/providers/auth-provider"
import './globals.css'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Samvaad AI - Bridging Language and Cultural Gaps in India',
  description: 'Smart India Hackathon 2025 project for multilingual communication with cultural context',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t py-6">
                <div className="container flex justify-between items-center">
                  <Logo />
                  <p className="text-sm text-muted-foreground">
                    © 2025 Samvaad AI. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}