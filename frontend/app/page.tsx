"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { MessageCircle, Globe, GraduationCap, Lightbulb, ArrowRight, Users } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  } // ✅ FIX: closed the function properly

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Samvaad AI
              </span>
            </motion.div>
          </div>
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
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              {/* Hero text */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Breaking Language Barriers Across India
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Samvaad AI helps you communicate across languages with cultural context and understanding.
                  </p>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/translate">
                      <Button size="lg" className="inline-flex items-center justify-center">
                        Start Translating
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/learn">
                      <Button variant="outline" size="lg">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Demo Chat */}
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full max-w-md"
                >
                  <Card className="shadow-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Live Demo</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                          <p className="text-sm font-medium">नमस्ते! आप कैसे हैं?</p>
                          <p className="text-xs text-muted-foreground mt-1">Hindi: "Hello! How are you?"</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex justify-end"
                      >
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                          <p className="text-sm">I'm doing well, thank you!</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                          <p className="text-sm font-medium">क्या आप भारत में हैं?</p>
                          <p className="text-xs text-muted-foreground mt-1">Hindi: "Are you in India?"</p>
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-2 border-blue-500">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                In India, it's common to ask about location as part of initial conversation.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        {/* (rest of your sections remain unchanged) */}
      </main>

      {/* Footer */}
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
    </div>
  )
}
