"use client"

import { useState, useRef } from "react"
import { Upload, X, Eye, Camera, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // em MB
  value?: string | null
  onChange: (file: File | null, preview: string | null) => void
  className?: string
}

export function FileUpload({
  label,
  accept = "image/jpeg,image/png,application/pdf",
  maxSize = 10,
  value,
  onChange,
  className = ""
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [fileName, setFileName] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      setFileName(file.name)
      setFileType(file.type)
      onChange(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName("")
    setFileType("")
    onChange(null, null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleView = () => {
    if (preview) {
      window.open(preview, "_blank")
    }
  }

  const getFileIcon = () => {
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />
    if (fileType.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-400" />
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm text-gray-300 font-medium flex items-center gap-2">
        <Upload className="w-4 h-4 text-blue-400" />
        {label}
        <span className="text-xs text-gray-500 font-normal">(opcional)</span>
      </Label>

      {!preview ? (
        <div className="space-y-3">
          {/* Botão de Upload */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 bg-slate-900/50 hover:bg-slate-800/50 border-2 border-dashed border-slate-600 hover:border-blue-500 text-gray-300 rounded-xl transition-all"
            >
              <Upload className="w-5 h-5 mr-2" />
              Escolher arquivo (PDF, JPG, PNG)
            </Button>
          </div>

          {/* Botão de Câmera (apenas em dispositivos com câmera) */}
          <div className="relative">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-12 bg-slate-900/50 hover:bg-slate-800/50 border-2 border-dashed border-slate-600 hover:border-blue-500 text-gray-300 rounded-xl transition-all"
            >
              <Camera className="w-5 h-5 mr-2" />
              Tirar foto
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Tamanho máximo: {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {fileName || "Arquivo anexado"}
                </p>
                <p className="text-xs text-gray-500">
                  {fileType.includes("pdf") ? "PDF" : "Imagem"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleView}
                size="sm"
                className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                size="sm"
                className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {fileType.includes("image") && (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
