import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/theme-toggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
            Chat
          </Link>
          <Link href="/translate" className="text-sm font-medium hover:underline underline-offset-4">
            Translate
          </Link>
          <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4">
            Learn
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}