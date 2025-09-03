import React, { useState } from 'react'
import { downloadDocument, deleteDocument } from '../services/api'

const DocumentItem = ({ document, onDeleteSuccess, onDeleteError }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      await downloadDocument(document.id, document.filename)
      // Show success message for download
      alert(`📥 Document "${document.filename}" downloaded successfully!`)
    } catch (error) {
      onDeleteError('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${document.filename}"?`)) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await deleteDocument(document.id)
      
      if (response.success) {
        onDeleteSuccess(document.id)
      } else {
        onDeleteError(response.message || 'Delete failed')
      }
    } catch (error) {
      onDeleteError('Delete failed. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="document-item">
      <div className="document-info">
        <div className="document-name">{document.filename}</div>
        <div className="document-meta">
          <span className="file-size">{formatFileSize(document.filesize)}</span>
          <span className="date">{formatDate(document.created_at)}</span>
        </div>
      </div>
      
      <div className="document-actions">
        <button
          className="btn btn-success"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <div className="spinner"></div>
              Downloading...
            </>
          ) : (
            <>
              📥 Download
            </>
          )}
        </button>
        
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="spinner"></div>
              Deleting...
            </>
          ) : (
            <>
              🗑️ Delete
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default DocumentItem
