"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'

// Define language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
];

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [culturalContext, setCulturalContext] = useState('');
  const [formalityLevel, setFormalityLevel] = useState('neutral');
  const [emotion, setEmotion] = useState('');
  const [tone, setTone] = useState('');
  const [imageToAudioLoading, setImageToAudioLoading] = useState(false);

  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage,
          formalityLevel
        })
      });
      if (!response.ok) throw new Error("Translation failed");
      const data = await response.json();
      setTranslatedText(data.translatedText || "");
      setCulturalContext(data.culturalContext || "");
      setEmotion(data.emotion || "");
      setTone(data.tone || "");
    } catch (error) {
      setTranslatedText("");
      setCulturalContext("");
      setEmotion("");
      setTone("");
      alert("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swapping languages
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Handle image to audio (example logic)
  const handleImageToAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageToAudioLoading(true);
    setTimeout(() => {
      const extractedText = "Simulated extracted text from image.";
      setSourceText(extractedText);
      const utterance = new window.SpeechSynthesisUtterance(extractedText);
      window.speechSynthesis.speak(utterance);
      setImageToAudioLoading(false);
      alert("Image processed and audio played.");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Samvaad AI
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4">
              Chat
            </Link>
            <Link href="/translate" className="text-sm font-medium underline underline-offset-4">
              Translate
            </Link>
            <Link href="/learn" className="text-sm font-medium hover:underline underline-offset-4">
              Learn
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cultural Translation</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <select 
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleSwapLanguages}
                  className="p-2 rounded-full hover:bg-muted"
                  aria-label="Swap languages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
                <select 
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formality" className="block text-sm font-medium mb-1">
                    Formality Level
                  </label>
                  <select 
                    id="formality"
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="formal">Formal</option>
                    <option value="neutral">Neutral</option>
                    <option value="informal">Informal</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="context" className="block text-sm font-medium mb-1">
                    Context
                  </label>
                  <select 
                    id="context"
                    className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="general">General</option>
                    <option value="business">Business</option>
                    <option value="academic">Academic</option>
                    <option value="casual">Casual</option>
                    <option value="festival">Festival/Celebration</option>
                  </select>
                </div>
              </div>
              <div>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full h-40 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setSourceText('')}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm hover:bg-muted"
                >
                  Clear
                </button>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm hover:bg-muted"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                    Voice
                  </button>
                  <button
                    onClick={handleTranslate}
                    disabled={isLoading || !sourceText.trim()}
                    className="rounded-md bg-primary px-4 py-1 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isLoading ? 'Translating...' : 'Translate'}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-1">Translate from:</label>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm shadow-sm hover:bg-muted" onClick={() => alert('Text input selected.')}>Text</button>
                <button className="rounded-md border px-3 py-1 text-sm shadow-sm hover:bg-muted" onClick={() => alert('Image upload coming soon.')}>Image</button>
                <button className="rounded-md border px-3 py-1 text-sm shadow-sm hover:bg-muted" onClick={() => alert('Audio recording coming soon.')}>Audio</button>
              </div>
              <input type="file" accept="image/*" className="mt-2" style={{display:'none'}} id="image-upload" onChange={handleImageToAudio} />
              <input type="file" accept="audio/*" className="mt-2" style={{display:'none'}} id="audio-upload" />
              <button
                type="button"
                className="px-2 py-1 rounded bg-blue-500 text-white"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Image to Audio
              </button>
              {imageToAudioLoading && <span className="ml-2 text-sm text-gray-500">Processing image...</span>}
              <div className="rounded-md border bg-muted/30 p-4 h-40 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                ) : translatedText ? (
                  <div>
                    <p>{translatedText}</p>
                    {emotion && (
                      <p className="mt-2 text-sm text-muted-foreground">Emotion Detected: <span className="font-medium">{emotion}</span></p>
                    )}
                    {tone && (
                      <p className="text-sm text-muted-foreground">Tone Detected: <span className="font-medium">{tone}</span></p>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground flex items-center justify-center h-full">
                    <p>Translation will appear here</p>
                  </div>
                )}
              </div>
              {culturalContext && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border bg-muted/30 p-4"
                >
                  <h3 className="font-medium text-sm mb-1">Cultural Context</h3>
                  <p className="text-sm text-muted-foreground">{culturalContext}</p>
                </motion.div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm hover:bg-muted"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Save to Phrasebook
                </button>
                <button
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm hover:bg-muted"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-lg border p-4 bg-muted/30">
            <h2 className="text-xl font-bold mb-4">Recently Learned Phrases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border p-3 bg-background">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">Hindi</span>
                  <span className="text-xs text-muted-foreground">Formal</span>
                </div>
                <p className="mt-1">नमस्ते, आप कैसे हैं?</p>
                <p className="text-sm text-muted-foreground">Hello, how are you?</p>
              </div>
              <div className="rounded-md border p-3 bg-background">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">Tamil</span>
                  <span className="text-xs text-muted-foreground">Casual</span>
                </div>
                <p className="mt-1">வணக்கம், எப்படி இருக்கிறீர்கள்?</p>
                <p className="text-sm text-muted-foreground">Hello, how are you?</p>
              </div>
              <div className="rounded-md border p-3 bg-background">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">Bengali</span>
                  <span className="text-xs text-muted-foreground">Festival</span>
                </div>
                <p className="mt-1">শুভ দুর্গা পূজা!</p>
                <p className="text-sm text-muted-foreground">Happy Durga Puja!</p>
              </div>
              <div className="rounded-md border p-3 bg-background">