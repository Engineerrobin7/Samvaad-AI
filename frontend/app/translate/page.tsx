"use client"

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';
import { VoiceInput } from '@/components/voice-input';
import { Image as ImageIcon, ArrowRightLeft, Loader2, AlertCircle } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' }, { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' }, { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' }, { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }, { code: 'pa', name: 'Punjabi' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TranslatePage() {
  const { getToken } = useAuth();
  const [sourceText, setSourceText] = useState('');
  const [result, setResult] = useState<{ translation: string; culturalContext: string; extractedText?: string } | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formalityLevel, setFormalityLevel] = useState('neutral');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async (textToTranslate = sourceText, imageFile: File | null = null) => {
    if (!textToTranslate.trim() && !imageFile) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    const token = await getToken();
    let url = `${API_URL}/ai/translate`;
    let body: any;
    let headers: any = { 'Authorization': `Bearer ${token}` };

    if (imageFile) {
        url = `${API_URL}/ai/translate-image`;
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('to', targetLanguage);
        formData.append('formality', formalityLevel);
        body = formData;
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
            text: textToTranslate,
            from: sourceLanguage,
            to: targetLanguage,
            formality: formalityLevel,
        });
    }

    try {
        const response = await fetch(url, { method: "POST", headers, body });
        if (!response.ok) throw new Error("Translation failed. Please check the console for details.");
        const data = await response.json();
        setResult(data);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (result) {
        setSourceText(result.translation);
        setResult(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSourceText(`Translating text from image: ${file.name}`);
      handleTranslate(`Translating from image: ${file.name}`, file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Samvaad AI</Link>
            <nav className="flex items-center gap-6">
                <Link href="/chat" className="text-sm font-medium hover:underline">Chat</Link>
                <Link href="/translate" className="text-sm font-medium underline">Translate</Link>
                <Link href="/learn" className="text-sm font-medium hover:underline">Learn</Link>
                <ThemeToggle />
            </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cultural Translation</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="rounded-md border bg-background px-3 py-1 text-sm">
                    {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
                <button onClick={handleSwapLanguages} className="p-2 rounded-full hover:bg-muted"><ArrowRightLeft size={20}/></button>
                <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="rounded-md border bg-background px-3 py-1 text-sm">
                    {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
              </div>
              <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter text to translate..." className="w-full h-40 rounded-md border bg-background p-2 text-sm"/>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <VoiceInput onTranscript={setSourceText} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-muted"><ImageIcon size={20}/></button>
                </div>
                <button onClick={() => handleTranslate()} disabled={isLoading || !sourceText.trim()} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50 flex items-center gap-2">
                    {isLoading && <Loader2 className="animate-spin" size={16}/>}
                    {isLoading ? 'Translating...' : 'Translate'}
                </button>
              </div>
            </div>
            
            {/* Output Column */}
            <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4 h-48 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>}
                    {error && <div className="text-red-500 flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
                    {result ? (
                        <div>
                            {result.extractedText && <p className="text-xs text-muted-foreground mb-2"><strong>Extracted:</strong> {result.extractedText}</p>}
                            <p>{result.translation}</p>
                        </div>
                    ) : !isLoading && <p className="text-muted-foreground">Translation will appear here</p>}
                </div>
                {result && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md border bg-muted/30 p-4">
                        <h3 className="font-medium text-sm mb-1">Cultural Context</h3>
                        <p className="text-sm text-muted-foreground">{result.culturalContext}</p>
                    </motion.div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}