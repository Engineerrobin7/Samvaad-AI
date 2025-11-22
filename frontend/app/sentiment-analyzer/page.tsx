'use client';

import { useState } from 'react';
import { Smile, Frown, Meh, Sparkles } from 'lucide-react';

export default function SentimentAnalyzerPage() {
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState<any>(null);
  const [adjustedText, setAdjustedText] = useState<any>(null);
  const [targetTone, setTargetTone] = useState('formal');
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sentiment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'en' }),
      });

      const data = await response.json();
      if (data.success) {
        setSentiment(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustTone = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sentiment/adjust-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetTone, language: 'en' }),
      });

      const data = await response.json();
      if (data.success) {
        setAdjustedText(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = () => {
    if (!sentiment) return null;
    
    switch (sentiment.sentiment) {
      case 'positive':
        return <Smile className="w-12 h-12 text-green-500" />;
      case 'negative':
        return <Frown className="w-12 h-12 text-red-500" />;
      default:
        return <Meh className="w-12 h-12 text-gray-500" />;
    }
  };

  const getSentimentColor = () => {
    if (!sentiment) return 'gray';
    
    switch (sentiment.sentiment) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-teal-900">
          😊 Sentiment Analyzer & Tone Adjuster
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <label className="block text-sm font-medium mb-2">Enter your text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full p-4 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-teal-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button
              onClick={analyzeSentiment}
              disabled={loading || !text.trim()}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium"
            >
              Analyze Sentiment
            </button>

            <div className="flex gap-2">
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="polite">Polite</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="empathetic">Empathetic</option>
              </select>
              <button
                onClick={adjustTone}
                disabled={loading || !text.trim()}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Adjust
              </button>
            </div>
          </div>
        </div>

        {/* Sentiment Analysis Result */}
        {sentiment && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4">Sentiment Analysis</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-shrink-0">
                {getSentimentIcon()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-4 py-2 rounded-full text-white font-bold bg-${getSentimentColor()}-500`}>
                    {sentiment.sentiment.toUpperCase()}
                  </span>
                  <span className="text-gray-600">
                    Score: {sentiment.score.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-${getSentimentColor()}-500`}
                    style={{ width: `${((sentiment.score + 1) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {sentiment.emotions && sentiment.emotions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Detected Emotions:</h3>
                <div className="flex flex-wrap gap-2">
                  {sentiment.emotions.map((emotion: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Confidence: {(sentiment.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        {/* Tone Adjustment Result */}
        {adjustedText && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Tone Adjusted Text</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Original</p>
                <p className="text-lg">{adjustedText.originalText}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-600 mb-2 font-semibold">
                  Adjusted ({adjustedText.tone})
                </p>
                <p className="text-lg">{adjustedText.adjustedText}</p>
              </div>

              {adjustedText.changes && adjustedText.changes.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Changes Made:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {adjustedText.changes.map((change: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
