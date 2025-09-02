"use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

export function ProgressTracker({ language }: { language: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fetch user's progress for this language
    const fetchProgress = async () => {
      // API call here
    }
    fetchProgress()
  }, [language])

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{language} Progress</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}