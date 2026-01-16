'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function AIAssistantPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('quality');
  const [loading, setLoading] = useState(false);

  // Quality Assessment State
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [qualityResult, setQualityResult] = useState<any>(null);

  // Smart Suggestions State
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Proficiency State
  const [proficiencyLang, setProficiencyLang] = useState('hi');
  const [proficiency, setProficiency] = useState<any>(null);

  // Learning Path State
  const [learningPath, setLearningPath] = useState<any>(null);

  // Error Detection State
  const [errorText, setErrorText] = useState('');
  const [errorAnalysis, setErrorAnalysis] = useState<any>(null);

  const assessQuality = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/assess-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          sourceText,
          translatedText,
          sourceLang,
          targetLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQualityResult(data);
      }
    } catch (error) {
      console.error('Quality assessment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSmartSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/smart-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          sourceText: suggestionText,
          sourceLang,
          targetLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessProficiency = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/ml/proficiency/${proficiencyLang}`,
        {
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProficiency(data);
      }
    } catch (error) {
      console.error('Proficiency error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          targetLanguage: proficiencyLang,
          currentLevel: proficiency?.level || 'Beginner'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPath(data);
      }
    } catch (error) {
      console.error('Learning path error:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectErrors = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ml/detect-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getToken()}`
        },
        body: JSON.stringify({
          translatedText: errorText,
          targetLanguage: targetLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        setErrorAnalysis(data);
      }
    } catch (error) {
      console.error('Error detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 AI Assistant
          </h1>
          <p className="text-gray-600">Powered by Advanced Machine Learning</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'quality', label: '📊 Quality Check', icon: '📊' },
            { id: 'suggestions', label: '💡 Smart Suggestions', icon: '💡' },
            { id: 'proficiency', label: '🎯 Proficiency', icon: '🎯' },
            { id: 'learning', label: '📚 Learning Path', icon: '📚' },
            { id: 'errors', label: '🔍 Error Detection', icon: '🔍' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Quality Assessment */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Translation Quality Assessment</h2>
              
              <div className="grid grid-cols-2 gap-4">
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

              <textarea
                placeholder="Enter source text..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />

              <textarea
                placeholder="Enter translated text..."
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />

              <button
                onClick={assessQuality}
                disabled={loading || !sourceText || !translatedText}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {loading ? 'Analyzing...' : 'Assess Quality'}
              </button>

              {qualityResult && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Quality Report</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Overall Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {qualityResult.score}/100
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Fluency</div>
                      <div className="text-2xl font-bold text-green-600">
                        {qualityResult.fluency}/100
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Accuracy</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {qualityResult.accuracy}/100
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Cultural Relevance</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {qualityResult.culturalRelevance}/100
                      </div>
                    </div>
                  </div>

                  {qualityResult.suggestions && qualityResult.suggestions.length > 0 && (
                    <div className="bg-white p-3 rounded">
                      <div className="font-semibold mb-2">💡 Suggestions:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {qualityResult.suggestions.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Smart Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Smart Translation Suggestions</h2>
              
              <textarea
                placeholder="Enter text to translate..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />

              <button
                onClick={getSmartSuggestions}
                disabled={loading || !suggestionText}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
              >
                {loading ? 'Generating...' : 'Get AI Suggestions'}
              </button>

              {suggestions.length > 0 && (
                <div className="space-y-3 mt-6">
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Option {i + 1}</div>
                        <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                          {suggestion.confidence}% confident
                        </div>
                      </div>
                      <div className="text-lg mb-2">{suggestion.text}</div>
                      <div className="text-sm text-gray-600">
                        💭 {suggestion.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proficiency Assessment */}
          {activeTab === 'proficiency' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Language Proficiency Assessment</h2>
              
              <select
                value={proficiencyLang}
                onChange={(e) => setProficiencyLang(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>

              <button
                onClick={assessProficiency}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
              >
                {loading ? 'Assessing...' : 'Assess My Proficiency'}
              </button>

              {proficiency && (
                <div className="mt-6 space-y-4">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
                    <div className="text-sm text-gray-600 mb-2">Your Level</div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {proficiency.level}
                    </div>
                    <div className="text-2xl font-semibold text-gray-700">
                      {proficiency.score}/100
                    </div>
                  </div>

                  {proficiency.strengths && proficiency.strengths.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-semibold mb-2">💪 Strengths:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {proficiency.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proficiency.weaknesses && proficiency.weaknesses.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="font-semibold mb-2">📈 Areas to Improve:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {proficiency.weaknesses.map((w: string, i: number) => (
                          <li key={i} className="text-sm">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proficiency.recommendations && proficiency.recommendations.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold mb-2">🎯 Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {proficiency.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-sm">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Learning Path */}
          {activeTab === 'learning' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Personalized Learning Path</h2>
              
              <button
                onClick={generateLearningPath}
                disabled={loading || !proficiency}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {loading ? 'Generating...' : 'Generate My Learning Path'}
              </button>

              {!proficiency && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  💡 Tip: Assess your proficiency first to get a personalized learning path!
                </div>
              )}

              {learningPath && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg text-center">
                    <div className="font-semibold">Estimated Completion Time</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {learningPath.estimatedCompletionTime}
                    </div>
                  </div>

                  {learningPath.modules && learningPath.modules.map((module: any, i: number) => (
                    <div key={i} className="p-4 border-l-4 border-indigo-600 bg-gray-50 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-lg">
                          Module {i + 1}: {module.title}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          module.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          module.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{module.description}</p>
                      <div className="text-sm text-gray-600 mb-2">
                        ⏱️ {module.estimatedTime}
                      </div>
                      {module.topics && (
                        <div className="flex flex-wrap gap-2">
                          {module.topics.map((topic: string, j: number) => (
                            <span key={j} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Detection */}
          {activeTab === 'errors' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">AI Error Detection & Correction</h2>
              
              <textarea
                placeholder="Enter text to check for errors..."
                value={errorText}
                onChange={(e) => setErrorText(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={4}
              />

              <button
                onClick={detectErrors}
                disabled={loading || !errorText}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                {loading ? 'Analyzing...' : 'Detect Errors'}
              </button>

              {errorAnalysis && (
                <div className="mt-6 space-y-4">
                  <div className={`p-4 rounded-lg ${
                    errorAnalysis.hasErrors ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <div className="font-semibold text-lg mb-2">
                      {errorAnalysis.hasErrors ? '⚠️ Errors Found' : '✅ No Errors Found'}
                    </div>
                  </div>

                  {errorAnalysis.errors && errorAnalysis.errors.length > 0 && (
                    <div className="space-y-3">
                      {errorAnalysis.errors.map((error: any, i: number) => (
                        <div key={i} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                          <div className="font-semibold text-yellow-800 mb-1">
                            {error.type.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            {error.description}
                          </div>
                          <div className="text-sm text-green-700">
                            💡 Suggestion: {error.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errorAnalysis.correctedText && errorAnalysis.hasErrors && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-semibold mb-2">✨ Corrected Version:</div>
                      <div className="text-gray-800">{errorAnalysis.correctedText}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
