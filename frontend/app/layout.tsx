import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from '@/components/theme-provider';
import { UserSync } from '@/components/user-sync';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Samvaad AI - Bridging Language Gaps',
  description: 'AI-powered multilingual communication with cultural context.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserSync /> {/* This component will handle user sync */}
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}