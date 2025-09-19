
// frontend/app/learn/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CheckCircle, Play, Loader2, GraduationCap, Languages } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Lesson {
    id: string;
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

interface AvailableLanguage {
    code: string;
    name: string;
}

// --- MOCK API HOOK (Replace with your actual API calls) ---
const useLearnData = (languageCode: string, token: string | null) => {
    const [languageDetails, setLanguageDetails] = useState<LanguageDetails | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchLanguageData = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch this from your backend
                // const res = await fetch(`${API_URL}/learn/details/${languageCode}`, { headers: { 'Authorization': `Bearer ${token}` } });
                // const data = await res.json();

                // MOCK DATA for demonstration
                const mockData: Record<string, LanguageDetails> = {
                    'hi': { name: 'Hindi', flag: '🇮🇳', progress: 60, level: 3, lessons: [
                        { id: '1', title: 'Greetings & Introductions', duration: 15, completed: true },
                        { id: '2', title: 'Basic Questions', duration: 20, completed: true },
                        { id: '3', title: 'Ordering Food', duration: 25, completed: false },
                        { id: '4', title: 'Asking for Directions', duration: 20, completed: false },
                    ]},
                    'pa': { name: 'Punjabi', flag: '🇮🇳', progress: 25, level: 1, lessons: [
                        { id: '5', title: 'The Alphabet', duration: 30, completed: true },
                        { id: '6', title: 'Common Phrases', duration: 20, completed: false },
                        { id: '7', title: 'Family & Relations', duration: 25, completed: false },
                    ]},
                };

                // Mock available languages
                setAvailableLanguages([{ code: 'hi', name: 'Hindi' }, { code: 'pa', name: 'Punjabi' }]);
                
                // Simulate network delay
                setTimeout(() => {
                    setLanguageDetails(mockData[languageCode]);
                    setIsLoading(false);
                }, 800);

            } catch (error) {
                console.error("Failed to fetch learning data", error);
                setLanguageDetails(null);
                setIsLoading(false);
            }
        };

        fetchLanguageData();
    }, [languageCode, token]);

    return { languageDetails, availableLanguages, isLoading };
};

// --- MAIN LEARN PAGE ---
export default function LearnPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('hi');
    
    useEffect(() => {
        const fetchToken = async () => {
            const token = await getToken();
            setAuthToken(token);
        };
        fetchToken();
    }, [getToken]);

    const { languageDetails, availableLanguages, isLoading } = useLearnData(selectedLanguage, authToken);

    const handleStartLesson = (lessonId: string) => {
        // In a real app, you would navigate to the lesson page
        // For now, we just log it.
        console.log(`Navigating to lesson ${lessonId}`);
        router.push(`/learn/lessons/${lessonId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <main className="container mx-auto py-8">
                {/* --- HEADER & LANGUAGE SELECTOR --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Hub</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Select a language and continue your journey.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage}>
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    <SelectValue placeholder="Select Language" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {availableLanguages.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : !languageDetails ? (
                    <p>Could not load language data.</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* --- LEFT COLUMN --- */}
                        <aside className="lg:col-span-1 space-y-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Current Language</CardTitle>
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{languageDetails.name} {languageDetails.flag}</div>
                                    <p className="text-xs text-muted-foreground">Level {languageDetails.level}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <Progress value={languageDetails.progress} />
                                    <p className="text-sm text-muted-foreground">{languageDetails.progress}% of Level {languageDetails.level} completed.</p>
                                </CardContent>
                            </Card>
                        </aside>

                        {/* --- RIGHT COLUMN (LESSONS) --- */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {languageDetails.lessons.map((lesson) => (
                                    <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                        <Card className={`flex flex-col h-full ${lesson.completed ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    {lesson.completed ? <CheckCircle className="text-green-500" size={20}/> : <Play className="text-primary" size={20}/>}
                                                    {lesson.title}
                                                </CardTitle>
                                                <CardDescription>Duration: {lesson.duration} min</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow" />
                                            <div className="p-6 pt-0">
                                                <Button className="w-full" disabled={lesson.completed} onClick={() => handleStartLesson(lesson.id)}>
                                                    {lesson.completed ? 'Completed' : 'Start Lesson'}
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
