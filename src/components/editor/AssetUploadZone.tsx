import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

interface AssetUploadZoneProps {
  onFileSelected: (file: File) => void
  isLoading?: boolean
}

const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
}

export function AssetUploadZone({ onFileSelected, isLoading = false }: AssetUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const acceptedTypes = [...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.audio]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (acceptedTypes.includes(file.type)) {
        onFileSelected(file)
      } else {
        alert(`File type not supported. Accepted: Images (JPEG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, WebM)`)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0])
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        disabled={isLoading}
        className="hidden"
      />

      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
      <p className="text-lg font-medium text-gray-900 mb-1">
        {isLoading ? 'Uploading...' : 'Drag and drop your file here'}
      </p>
      <p className="text-sm text-gray-600">or click to browse</p>
      <p className="text-xs text-gray-500 mt-3">Supported: Images (JPEG, PNG, GIF, WebP) and Audio (MP3, WAV, OGG, WebM)</p>
      <p className="text-xs text-gray-500 mt-1">Max file size: 10 MB</p>
    </div>
  )
}
