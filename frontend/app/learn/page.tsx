"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen, Trophy, Clock, Star, Play, CheckCircle, Lock } from 'lucide-react'

export default function LearnPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('hindi')

  const languages = {
    hindi: {
      name: 'Hindi',
      flag: '🇮🇳',
      progress: 65,
      level: 3,
      lessons: [
        { id: 1, title: 'Basic Greetings', completed: true, duration: '10 min' },
        { id: 2, title: 'Family Members', completed: true, duration: '15 min' },
        { id: 3, title: 'Numbers 1-20', completed: true, duration: '12 min' },
        { id: 4, title: 'Common Phrases', completed: false, duration: '18 min' },
        { id: 5, title: 'Food & Dining', completed: false, duration: '20 min' },
        { id: 6, title: 'Directions', completed: false, duration: '16 min' }
      ],
      dailyChallenge: {
        title: 'Cultural Context Challenge',
        description: 'Learn when to use "आप" vs "तुम" in Hindi conversations',
        points: 50,
        timeLeft: '2h 30m'
      }
    },
    bengali: {
      name: 'Bengali',
      flag: '🇧🇩',
      progress: 30,
      level: 1,
      lessons: [
        { id: 1, title: 'Bengali Alphabet', completed: true, duration: '25 min' },
        { id: 2, title: 'Basic Greetings', completed: true, duration: '12 min' },
        { id: 3, title: 'Common Words', completed: false, duration: '15 min' },
        { id: 4, title: 'Family Terms', completed: false, duration: '18 min' },
        { id: 5, title: 'Numbers', completed: false, duration: '14 min' },
        { id: 6, title: 'Colors', completed: false, duration: '10 min' }
      ],
      dailyChallenge: {
        title: 'Pronunciation Practice',
        description: 'Master the pronunciation of Bengali vowels',
        points: 30,
        timeLeft: '4h 15m'
      }
    }
  }

  const currentLang = languages[selectedLanguage as keyof typeof languages]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Samvaad AI
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <Link href="/translate" className="text-sm font-medium hover:underline underline-offset-4">
              Translate
            </Link>
            <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4 text-primary">
              Learn
            </Link>
            <ThemeToggle />
            <Link 
              href="/login" 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Language Learning</h1>
            <p className="text-muted-foreground">Master Indian languages with cultural context</p>
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(languages).map(([key, lang]) => (
              <Card 
                key={key} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedLanguage === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedLanguage(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <CardTitle className="text-xl">{lang.name}</CardTitle>
                        <CardDescription>Level {lang.level}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{lang.progress}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{lang.progress}%</span>
                    </div>
                    <Progress value={lang.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Language Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lessons */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentLang.name} Lessons
                  </CardTitle>
                  <CardDescription>
                    Continue your {currentLang.name} learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentLang.lessons.map((lesson, index) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          lesson.completed 
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            lesson.completed 
                              ? 'bg-green-500 text-white' 
                              : index === 3 
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted-foreground/20'
                          }`}>
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : index === 3 ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant={lesson.completed ? "outline" : index === 3 ? "default" : "ghost"}
                          size="sm"
                          disabled={!lesson.completed && index !== 3}
                        >
                          {lesson.completed ? 'Review' : index === 3 ? 'Start' : 'Locked'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Challenge & Stats */}
            <div className="space-y-6">
              {/* Daily Challenge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Daily Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{currentLang.dailyChallenge.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {currentLang.dailyChallenge.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{currentLang.dailyChallenge.points} points</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{currentLang.dailyChallenge.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">
                      Start Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Level</span>
                      <Badge variant="secondary">Level {currentLang.level}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lessons Completed</span>
                      <span className="text-sm font-medium">
                        {currentLang.lessons.filter(l => l.completed).length}/{currentLang.lessons.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Progress</span>
                      <span className="text-sm font-medium">{currentLang.progress}%</span>
                    </div>
                    <Progress value={currentLang.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Cultural Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Cultural Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm">
                        In Hindi, "Namaste" is used as both hello and goodbye.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-sm">
                        When speaking to elders in Hindi, use "आप" (aap) instead of "तुम" (tum).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}