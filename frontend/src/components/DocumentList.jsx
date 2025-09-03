import React from 'react'
import DocumentItem from './DocumentItem'

const DocumentList = ({ documents, onDeleteSuccess, onDeleteError, onRefresh }) => {
  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-text">No documents uploaded yet</div>
        <div className="empty-state-hint">
          Upload your first medical document to get started
        </div>
      </div>
    )
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <DocumentItem
          key={document.id}
          document={document}
          onDeleteSuccess={onDeleteSuccess}
          onDeleteError={onDeleteError}
        />
      ))}
    </div>
  )
}

export default DocumentList
