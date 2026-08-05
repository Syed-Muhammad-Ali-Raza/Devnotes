'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react'

interface TextToSpeechProps {
  contentMarkdown: string
  title: string
}

function stripMarkdown(md: string): string {
  if (!md) return ''
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep only link text
    .replace(/`{3}[\s\S]*?`{3}/g, 'Code block skipped.') // Skip raw code blocks
    .replace(/`.*?`/g, '') // Remove inline code
    .replace(/[#*_\-~>+]/g, '') // Remove basic MD symbols
    .replace(/\s+/g, ' ')
    .trim()
}

export default function TextToSpeech({ contentMarkdown, title }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function startSpeech() {
    if (!isSupported) return

    window.speechSynthesis.cancel() // Stop any current speech

    const plainText = stripMarkdown(contentMarkdown)
    const fullText = `Reading: ${title}. ${plainText}`
    
    const utterance = new SpeechSynthesisUtterance(fullText)
    utteranceRef.current = utterance

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e)
      setIsPlaying(false)
      setIsPaused(false)
    }

    setIsPlaying(true)
    setIsPaused(false)
    window.speechSynthesis.speak(utterance)
  }

  function handlePlayPause() {
    if (!isSupported) return

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume()
        setIsPaused(false)
      } else {
        window.speechSynthesis.pause()
        setIsPaused(true)
      }
    } else {
      startSpeech()
    }
  }

  function handleStop() {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  if (!isSupported) return null

  return (
    <div 
      className="flex items-center gap-3 bg-zinc-50 border border-zinc-150 rounded-2xl p-3.5 mt-2 mb-6"
      role="region"
      aria-label="Audio Reader"
    >
      <div className="p-2 bg-zinc-100 rounded-xl text-zinc-600">
        <Volume2 className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-800">Listen to this article</p>
        <p className="text-[10px] text-zinc-400 truncate">Powered by your browser's screen narration</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition active:scale-95 shadow-sm p-2"
          aria-label={isPlaying ? (isPaused ? 'Resume narration' : 'Pause narration') : 'Play audio narration'}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
        </button>
        {isPlaying && (
          <button
            onClick={handleStop}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition active:scale-95 p-2"
            aria-label="Stop audio narration"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  )
}
