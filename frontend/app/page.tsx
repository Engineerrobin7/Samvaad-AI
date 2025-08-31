"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  }

  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Experience seamless communication with cultural understanding
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>Cultural Translation</CardTitle>
                    <CardDescription>
                      Not just words, but meaning with cultural context
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                      <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>Real-time Chat</CardTitle>
                    <CardDescription>
                      Seamless conversations across languages
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                      <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>Learning Snippets</CardTitle>
                    <CardDescription>
                      Learn cultural nuances as you communicate
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Your Journey?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of users breaking language barriers across India
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {user ? (
                  <>
                    <Link href="/chat">
                      <Button size="lg">
                        Start Chatting
                        <MessageCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/learn">
                      <Button variant="outline" size="lg">
                        Continue Learning
                        <GraduationCap className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg">
                        Sign In
                        <Users className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how Samvaad AI helps bridge language and cultural gaps in India
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m8 9 3 3-3 3"></path>
                    <path d="M13 15h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Cultural Sensitivity</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Translations with cultural context, formal vs informal tones, and regional nuances
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Real-time Chat</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Multilingual conversations with instant translation and cultural context
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Learning Snippets</h3>
                <p className="text-sm text-muted-foreground text-center">
                  AI-powered cultural learning cards to understand regional customs and expressions
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
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