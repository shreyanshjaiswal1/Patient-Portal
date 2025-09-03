import React, { useState, useRef } from 'react'
import { uploadDocument } from '../services/api'

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file) => {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      onUploadError('Please select a PDF file')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      onUploadError('File size must be less than 10MB')
      return
    }

    // Check for duplicates before uploading
    try {
      const duplicateCheck = await checkDuplicate(file.name, file.size)
      if (duplicateCheck.isDuplicate) {
        const duplicate = duplicateCheck.duplicate
        onUploadError(`❌ File already exists: "${duplicate.filename}" (uploaded on ${new Date(duplicate.uploadedAt).toLocaleDateString()})`)
        return
      }
    } catch (error) {
      console.log('Duplicate check failed, proceeding with upload:', error)
    }

    uploadFile(file)
  }

  const uploadFile = async (file) => {
    try {
      setIsUploading(true)
      const response = await uploadDocument(file)
      
      if (response.success) {
        onUploadSuccess(response.data)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        onUploadError(response.message || 'Upload failed')
      }
    } catch (error) {
      console.log('Upload error details:', error)
      console.log('Error message:', error.message)
      console.log('Error response:', error.response)
      
      // Pass through the specific error message instead of generic message
      onUploadError(error.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`upload-area ${isDragging ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
      />
      
      <div className="upload-icon">📄</div>
      <div className="upload-text">
        {isUploading ? 'Uploading...' : 'Drop your PDF here or click to browse'}
      </div>
      <div className="upload-hint">
        Only PDF files are allowed (max 10MB)
      </div>
      
      {isUploading && (
        <div className="loading" style={{ marginTop: '1rem' }}>
          <div className="spinner"></div>
          Processing your document...
        </div>
      )}
    </div>
  )
}

export default FileUpload
