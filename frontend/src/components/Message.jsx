import React from 'react'

const Message = ({ message }) => {
  if (!message) return null

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📝'
    }
  }

  return (
    <div className={`message ${message.type}`}>
      <span className="message-icon">{getIcon(message.type)}</span>
      <span className="message-text">{message.text}</span>
    </div>
  )
}

export default Message
