'use client'

import React, { useState, KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed]
      onChange(newTags)
      setInputValue('')
    }
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, idx) => idx !== indexToRemove)
    onChange(newTags)
  }

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5" />
        Tags / Topics
      </label>
      <div className="flex flex-wrap gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:ring-2 focus-within:ring-zinc-950 focus-within:bg-white transition duration-200">
        {tags.map((tag, idx) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-white border border-zinc-250 text-zinc-800 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-lg"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-zinc-400 hover:text-zinc-900 rounded-md p-0.5 hover:bg-zinc-100 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add tags (press Enter or comma)..." : "Add tag..."}
          className="flex-1 bg-transparent text-sm text-zinc-900 outline-none min-w-[150px] placeholder-zinc-400"
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1.5">
        Tags can only contain lowercase letters, numbers, and dashes.
      </p>
    </div>
  )
}
