"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Lock, Play, Loader2 } from 'lucide-react';

interface Lesson {
    id: number;
    title: string;
    duration: number;
    completed: boolean;
}

interface LanguageDetails {
    name: string;
    flag: string;
    progress: number;
    level: number;
    lessons: Lesson[];
    availableLanguages?: { code: string; name: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LearnPage() {
  const { getToken } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [languageData, setLanguageData] = useState<LanguageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguageData = async () => {
      setIsLoading(true);
      const token = await getToken();
      try {
        const res = await fetch(`${API_URL}/learn/details/${selectedLanguage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLanguageData(data);
      } catch (error) {
        console.error("Failed to fetch learning data", error);
        setLanguageData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLanguageData();
  } // <-- end of useEffect function
  , [selectedLanguage, getToken]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        {/* ... Navbar ... */}
      </header>
      <main className="flex-1 container py-8 flex flex-row gap-8">
        {/* Sidebar for navigation */}
        <aside className="hidden lg:block w-64 bg-muted rounded-lg p-6 mr-8">
          <nav className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <Link href="/learn" className="block py-2 px-3 rounded hover:bg-primary/10">Dashboard</Link>
            <Link href="/learn/lessons" className="block py-2 px-3 rounded hover:bg-primary/10">Lessons</Link>
            <Link href="/learn/progress" className="block py-2 px-3 rounded hover:bg-primary/10">Progress</Link>
            <Link href="/learn/tips" className="block py-2 px-3 rounded hover:bg-primary/10">Cultural Tips</Link>
          </nav>
        </aside>
        <section className="flex-1">
          {/* Motivational Banner */}
          <div className="bg-gradient-to-r from-primary to-green-400 text-white rounded-lg p-6 mb-8 shadow flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back!</h2>
              <p className="text-sm">Keep up the great work learning {languageData?.name || 'your language'}!</p>
            </div>
            <div className="hidden md:block">
              <BookOpen size={48}/>
            </div>
          </div>
        </section>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p>Level: {languageData ? languageData.level : "-"}</p>
              <Progress value={languageData ? languageData.progress : 0}/>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languageData?.lessons?.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-start border-2 ${lesson.completed ? 'border-green-400' : 'border-primary'}`}
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {lesson.completed ? <CheckCircle className="text-green-500" size={20}/> : <Play className="text-primary" size={20}/>}
                Lesson {lesson.id}: {lesson.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Duration: {lesson.duration} min</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded ${lesson.completed ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>Progress: {lesson.completed ? '100%' : '0%'}</span>
                <progress value={lesson.completed ? 100 : 0} max="100" className="w-24 h-2"></progress>
              </div>
              <Button
                className="mt-auto"
                disabled={lesson.completed}
                onClick={() => alert(`Starting lesson: ${lesson.title}`)}
              >
                {lesson.completed ? 'Completed' : 'Start Lesson'}
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}