import axios from 'axios'

const API_BASE_URL = 'http://localhost:5001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// API functions
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.log('API Error caught:', error)
    console.log('Error response:', error.response)
    console.log('Error status:', error.response?.status)
    console.log('Error data:', error.response?.data)
    
    if (error.response?.data) {
      // Handle duplicate file error specifically
      if (error.response.status === 409) {
        const duplicateData = error.response.data
        const errorMessage = `File already exists: "${duplicateData.duplicate.filename}" (uploaded on ${new Date(duplicateData.duplicate.uploadedAt).toLocaleDateString()})`
        console.log('Throwing duplicate error:', errorMessage)
        throw new Error(errorMessage)
      }
      throw new Error(error.response.data.message || 'Upload failed')
    }
    throw error
  }
}

// Check for duplicate files before upload
export const checkDuplicate = async (filename, filesize) => {
  try {
    const response = await api.post('/documents/check-duplicate', {
      filename,
      filesize
    })
    return response.data
  } catch (error) {
    console.error('Duplicate check failed:', error)
    return { success: false, isDuplicate: false }
  }
}

export const fetchDocuments = async () => {
  try {
    const response = await api.get('/documents')
    return response.data
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch documents')
    }
    throw error
  }
}

export const downloadDocument = async (id, filename) => {
  try {
    const response = await api.get(`/documents/${id}`, {
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Download failed')
    }
    throw error
  }
}

export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Delete failed')
    }
    throw error
  }
}

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('API is not available')
  }
}

export default api
