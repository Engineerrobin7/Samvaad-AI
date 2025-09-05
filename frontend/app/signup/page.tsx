"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import dynamic from "next/dynamic"
import { useAuth } from "@/providers/auth-provider"

const Eye = dynamic(() => import("lucide-react").then(m => m.Eye), { ssr: false })
const EyeOff = dynamic(() => import("lucide-react").then(m => m.EyeOff), { ssr: false })
const Mail = dynamic(() => import("lucide-react").then(m => m.Mail), { ssr: false })
const Lock = dynamic(() => import("lucide-react").then(m => m.Lock), { ssr: false })
const User = dynamic(() => import("lucide-react").then(m => m.User), { ssr: false })
const Globe = dynamic(() => import("lucide-react").then(m => m.Globe), { ssr: false })

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferred_language: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "te", label: "Telugu" },
    { value: "ta", label: "Tamil" },
    { value: "mr", label: "Marathi" },
    { value: "gu", label: "Gujarati" },
    { value: "kn", label: "Kannada" },
    { value: "ml", label: "Malayalam" },
    { value: "pa", label: "Punjabi" },
    { value: "or", label: "Odia" },
    { value: "as", label: "Assamese" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    // Frontend validation for required fields
    if (!formData.name || !formData.email || !formData.password || !formData.preferred_language) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }
    try {
      await register({
        name: formData.name,
        email: formData.email,
        preferred_language: formData.preferred_language
      }, formData.password)
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2 tracking-tight">
            Samvaad AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            Create your free account and start your language journey!
          </p>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <User className="h-5 w-5" />
              </span>
              <input
                id="name"
                type="text"
                required
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                required
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                placeholder="Enter your email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                placeholder="Create a password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-2 top-2.5 text-gray-400 hover:text-blue-600 transition"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Native Language
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Globe className="h-5 w-5" />
              </span>
              <select
                id="preferred_language"
                required
                title="Select your preferred language"
                aria-label="Preferred Language"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                value={formData.preferred_language}
                onChange={e => setFormData({ ...formData, preferred_language: e.target.value })}
              >
                <option value="" disabled>
                  Select your preferred language
                </option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="learningLanguages" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Languages You Want to Learn
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Globe className="h-5 w-5" />
              </span>
              <select
                id="learningLanguages"
                multiple
                required
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                value={formData.learningLanguages}
                onChange={e => setFormData({ ...formData, learningLanguages: Array.from(e.target.selectedOptions, option => option.value) })}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}