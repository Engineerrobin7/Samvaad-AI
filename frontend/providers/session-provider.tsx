
// frontend/providers/session-provider.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- TYPE DEFINITIONS ---
interface ActionItem {
  text: string;
  isDone: boolean;
}

interface AnalysisData {
  summary: string;
  actionItems: ActionItem[];
}

interface SessionContextType {
  analysisData: AnalysisData | null;
  isLoading: boolean;
  error: string | null;
  startAnalysis: (file: File) => Promise<void>;
}

// --- CONTEXT CREATION ---
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    const formData = new FormData();
    formData.append('transcript', file);

    try {
      // NOTE: You might need to add an auth token to the headers
      const response = await fetch('/api/ai/analyze-transcript', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      if (result.success) {
        setAnalysisData(result.data);
      } else {
        throw new Error(result.message || 'Analysis failed to return success.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider value={{ analysisData, isLoading, error, startAnalysis }}>
      {children}
    </SessionContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
