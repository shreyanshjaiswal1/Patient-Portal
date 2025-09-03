import React, { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import DocumentList from './DocumentList'
import Message from './Message'
import { fetchDocuments } from '../services/api'

const DocumentManager = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetchDocuments()
      if (response.success) {
        setDocuments(response.data)
      } else {
        showMessage('Error loading documents', 'error')
      }
    } catch (error) {
      showMessage('Failed to load documents', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleUploadSuccess = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev])
    showMessage(`✅ Document "${newDocument.filename}" uploaded successfully!`, 'success')
  }

  const handleUploadError = (error) => {
    showMessage(error, 'error')
  }

  const handleDeleteSuccess = (deletedId) => {
    const deletedDoc = documents.find(doc => doc.id === deletedId)
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId))
    showMessage(`🗑️ Document "${deletedDoc?.filename || 'Unknown'}" deleted successfully!`, 'success')
  }

  const handleDeleteError = (error) => {
    showMessage(error, 'error')
  }

  return (
    <div>
      {message && <Message message={message} />}
      
      <div className="card">
        <h2>📄 Upload Medical Document</h2>
        <FileUpload 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      <div className="card">
        <h2>📋 Your Documents</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading documents...
          </div>
        ) : (
          <DocumentList 
            documents={documents}
            onDeleteSuccess={handleDeleteSuccess}
            onDeleteError={handleDeleteError}
            onRefresh={loadDocuments}
          />
        )}
      </div>
    </div>
  )
}

export default DocumentManager
