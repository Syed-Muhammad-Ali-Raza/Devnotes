'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, ImageIcon, X } from 'lucide-react'
import { isCoverMime, isAvatarMime, objectMime } from '@/lib/storage'

type UploadPurpose = 'cover' | 'avatar'

interface ImagePickerProps {
  purpose: UploadPurpose
  // The last persisted/public URL (shown if no new local file is selected).
  persistedUrl: string
  onFileSelected: (file: File | null) => void
  onCleared: () => void
  label: string
}

export default function ImagePicker({
  purpose,
  persistedUrl,
  onFileSelected,
  onCleared,
  label,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isAvatar = purpose === 'avatar'

  // Clean up object URLs to avoid leaks.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function handleFile(file: File) {
    setError('')
    const mime = objectMime(file)

    if (isAvatar ? !isAvatarMime(mime) : !isCoverMime(mime)) {
      setError('Only JPEG, PNG, or WebP images are allowed.')
      onFileSelected(null)
      return
    }

    if (localPreview) URL.revokeObjectURL(localPreview)
    const preview = URL.createObjectURL(file)
    setLocalPreview(preview)
    onFileSelected(file)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) handleFile(file)
  }

  function clear() {
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(null)
    setError('')
    onFileSelected(null)
    onCleared()
  }

  const shownSource = localPreview ?? persistedUrl

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="mt-2 flex items-start gap-4">
        {shownSource ? (
          <img
            src={shownSource}
            alt={`${label} preview`}
            className={
              isAvatar
                ? 'w-16 h-16 rounded-full object-cover border border-zinc-200 shadow-sm'
                : 'w-32 h-20 object-cover rounded-lg border border-zinc-200 shadow-sm'
            }
          />
        ) : (
          <div
            className={
              isAvatar
                ? 'w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400'
                : 'w-32 h-20 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400'
            }
          >
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
            >
              <Upload className="w-4 h-4" />
              {localPreview ? 'Choose another' : 'Upload image'}
            </button>
            {shownSource && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onChange}
              className="hidden"
            />
          </div>
          <p className="text-xs text-zinc-400">JPEG, PNG, or WebP only.</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
