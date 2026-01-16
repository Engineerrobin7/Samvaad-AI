'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  name: string;
  owner_id: string;
  source_language: string;
  target_language: string;
  created_at: string;
  participants: string[];
}

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  user_id: string;
  status: 'draft' | 'review' | 'approved';
  votes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  user_id: string;
  text: string;
  timestamp: string;
}

interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  user_id: string;
}

export default function CollaborationPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newSessionName, setNewSessionName] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [newSourceText, setNewSourceText] = useState('');
  const [newTranslatedText, setNewTranslatedText] = useState('');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserSessions();
    }
  }, [isLoaded, user, router]);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/collaboration/sessions', {
        headers: {
          'Authorization': `Bearer ${await user?.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      setError('Failed to fetch sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/collaboration/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          name: newSessionName,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        })
      });

      if (response.ok) {
        const newSession = await response.json();
        setSessions([...sessions, newSession]);
        setNewSessionName('');
        setError(null);
      }
    } catch (err) {
      setError('Failed to create session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (session: Session) => {
    setSelectedSession(session);
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/collaboration/sessions/${session.id}/translations`,
        {
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      }
    } catch (err) {
      setError('Failed to fetch translations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/collaboration/sessions/${selectedSession.id}/translations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getToken()}`
          },
          body: JSON.stringify({
            sourceText: newSourceText,
            translatedText: newTranslatedText
          })
        }
      );

      if (response.ok) {
        const newTranslation = await response.json();
        setTranslations([newTranslation, ...translations]);
        setNewSourceText('');
        setNewTranslatedText('');
        setError(null);
      }
    } catch (err) {
      setError('Failed to add translation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const voteTranslation = async (translationId: string, vote: 1 | -1) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/collaboration/translations/${translationId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getToken()}`
          },
          body: JSON.stringify({ vote })
        }
      );

      if (response.ok) {
        const { votes } = await response.json();
        setTranslations(translations.map(t => 
          t.id === translationId ? { ...t, votes } : t
        ));
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Collaborative Translation Workspace</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
              
              {/* Create Session Form */}
              <form onSubmit={createSession} className="mb-6">
                <input
                  type="text"
                  placeholder="Session name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-2"
                  required
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  Create Session
                </button>
              </form>

              {/* Sessions List */}
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedSession?.id === session.id ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-semibold">{session.name}</div>
                    <div className="text-sm text-gray-600">
                      {session.source_language} → {session.target_language}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.participants?.length || 0} participants
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {selectedSession.name}
                </h2>

                {/* Add Translation Form */}
                <form onSubmit={addTranslation} className="mb-6 p-4 bg-gray-50 rounded">
                  <textarea
                    placeholder="Source text"
                    value={newSourceText}
                    onChange={(e) => setNewSourceText(e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                    required
                  />
                  <textarea
                    placeholder="Translated text"
                    value={newTranslatedText}
                    onChange={(e) => setNewTranslatedText(e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-2"
                    rows={2}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={loading}
                  >
                    Add Translation
                  </button>
                </form>

                {/* Translations List */}
                <div className="space-y-4">
                  {translations.map((translation) => (
                    <div
                      key={translation.id}
                      className="border rounded p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-gray-700 mb-2">
                            <strong>Source:</strong> {translation.source_text}
                          </div>
                          <div className="text-gray-900 mb-2">
                            <strong>Translation:</strong> {translation.translated_text}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            translation.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : translation.status === 'review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {translation.status}
                        </span>
                      </div>

                      {/* Voting */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => voteTranslation(translation.id, 1)}
                          className="text-green-600 hover:text-green-700"
                        >
                          👍 Upvote
                        </button>
                        <span className="font-semibold">{translation.votes} votes</span>
                        <button
                          onClick={() => voteTranslation(translation.id, -1)}
                          className="text-red-600 hover:text-red-700"
                        >
                          👎 Downvote
                        </button>
                      </div>

                      {/* Comments */}
                      {translation.comments && translation.comments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-gray-600">
                            {translation.comments.length} comment(s)
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {translations.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No translations yet. Add the first one!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a session to view translations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
