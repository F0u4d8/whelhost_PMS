import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  allowedTypes?: string[]
  label?: string
}

export function FileUpload({ onFilesChange, maxFiles = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp"], label = "Upload Images" }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)
    const validFiles = newFiles.filter(file => allowedTypes.includes(file.type))

    if (validFiles.length !== newFiles.length) {
      alert(`Only ${allowedTypes.join(", ")} files are allowed`)
    }

    const totalFiles = files.length + validFiles.length
    if (maxFiles && totalFiles > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`)
      return
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    
    const updatedFiles = [...files, ...validFiles]
    const updatedPreviews = [...previews, ...newPreviews]

    setFiles(updatedFiles)
    setPreviews(updatedPreviews)
    onFilesChange(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    const updatedPreviews = previews.filter((_, i) => i !== index)

    // Revoke the object URLs to free up memory
    URL.revokeObjectURL(previews[index])

    setFiles(updatedFiles)
    setPreviews(updatedPreviews)
    onFilesChange(updatedFiles)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
        >
          {label}
        </label>
        <p className="text-sm text-muted-foreground mt-2">
          {maxFiles ? `Max ${maxFiles} files` : "Multiple files allowed"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Allowed: {allowedTypes.map(type => type.split("/")[1]).join(", ")}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`Preview ${index}`} 
                className="rounded-lg object-cover w-full h-32"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}