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
  }, [selectedLanguage, getToken]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        {/* ... Navbar ... */}
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-2">Language Learning</h1>
        <p className="text-muted-foreground mb-8">Master Indian languages with cultural context</p>
        
        {/* Language Selection can be improved to fetch languages from backend */}
        <div className="flex gap-4 mb-8">
            <Button variant={selectedLanguage === 'hi' ? 'default' : 'outline'} onClick={() => setSelectedLanguage('hi')}>Hindi</Button>
            <Button variant={selectedLanguage === 'bn' ? 'default' : 'outline'} onClick={() => setSelectedLanguage('bn')}>Bengali</Button>
        </div>

        {isLoading ? <div className="flex justify-center mt-8"><Loader2 className="animate-spin" size={32}/></div> :
         !languageData ? <p>Could not load learning data.</p> :
         (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen/>{languageData.name} Lessons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {languageData.lessons.map((lesson, index) => {
                    const isPlayable = lesson.completed || languageData.lessons.findIndex(l => !l.completed) === index;
                    return (
                        <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.completed ? 'bg-green-500 text-white' : isPlayable ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {lesson.completed ? <CheckCircle/> : isPlayable ? <Play/> : <Lock/>}
                                </div>
                                <div>
                                    <h4 className="font-medium">{lesson.title}</h4>
                                    <p className="text-sm text-muted-foreground">{lesson.duration} min</p>
                                </div>
                            </div>
                            <Button variant={isPlayable ? "default" : "ghost"} size="sm" disabled={!isPlayable}>
                                {lesson.completed ? 'Review' : 'Start'}
                            </Button>
                        </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p>Level: {languageData.level}</p>
                        <Progress value={languageData.progress}/>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}