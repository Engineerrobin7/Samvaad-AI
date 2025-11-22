'use client';

import { useState, useRef } from 'react';
import { Mic, Volume2, Loader2 } from 'lucide-react';

export default function VoiceTranslatePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await translateVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const translateVoice = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('http://localhost:5000/api/voice/translate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(`http://localhost:5000${result.audioUrl}`);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          🎤 Voice Translation
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Source Language</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="bn">Bengali</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="hi">Hindi</option>
                <option value="en">English</option>
                <option value="bn">Bengali</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-8 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white disabled:opacity-50`}
            >
              {isLoading ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>
          </div>

          <p className="text-center text-gray-600">
            {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
          </p>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Translation Result</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Original ({sourceLanguage})</p>
                <p className="text-lg">{result.originalText}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Translation ({targetLanguage})</p>
                <p className="text-lg">{result.translatedText}</p>
              </div>

              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                <Volume2 className="w-5 h-5" />
                Play Translation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
