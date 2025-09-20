<nav className="flex items-center justify-between py-4 px-6 border-b">
  <div className="flex items-center gap-6">
    <Link href="/" className="font-bold text-xl">Samvaad AI</Link>
    <Link href="/chat" className="hover:underline">Chat</Link>
    <Link href="/learn" className="hover:underline">Learn</Link>
  </div>
  <div className="flex items-center gap-4">
    <ThemeToggle />
    {/* Clerk authentication button placed here */}
    <ClerkButton />
  </div>
</nav>

<footer className="border-t">
  <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">Samvaad AI</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Bridging language and cultural gaps in India through AI-powered translation with cultural sensitivity.
      </p>
    </div>
    <div className="flex flex-col gap-2 md:gap-4">
      <h3 className="text-sm font-medium">Quick Links</h3>
      <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/features" className="hover:underline">Features</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>
    </div>
    <div className="flex flex-col gap-2 md:gap-4">
      <h3 className="text-sm font-medium">Legal</h3>
      <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
      </nav>
    </div>
  </div>
  <div className="border-t py-6">
    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
      <p className="text-center text-sm text-muted-foreground md:text-left">
        © 2025 Samvaad AI. All rights reserved. Smart India Hackathon 2025 Project.
      </p>
    </div>
  </div>
</footer>