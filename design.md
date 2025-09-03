
i# Patient Portal - Design Document

## 🎯 Project Overview
A simple patient portal application that allows users to upload, view, download, and delete PDF medical documents. The application runs locally with a React frontend and Node.js backend.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with Vite for fast development and building
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite3 with better-sqlite3 package for better performance
- **File Storage**: Local filesystem with `uploads/` directory
- **Routing**: React Router for frontend navigation
- **HTTP Client**: Axios for API communication
- **File Upload**: Multer middleware for handling multipart/form-data

### System Architecture
```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐    File I/O    ┌─────────────────┐
│   React App     │ ──────────────────→ │  Express Server │ ──────────────→ │  Local Storage  │
│   (Port 3000)   │                     │   (Port 5000)   │                │   (uploads/)     │
└─────────────────┘                     └─────────────────┘                └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │   SQLite DB     │
                                        │  (documents)    │
                                        └─────────────────┘
```

## 🔌 API Specification

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Upload Document
- **POST** `/documents/upload`
- **Description**: Upload a PDF file to the system
- **Content-Type**: `multipart/form-data`
- **Request Body**: 
  - `file`: PDF file (required)
- **Response**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "id": 1,
      "filename": "medical_report.pdf",
      "filepath": "uploads/medical_report_1234567890.pdf",
      "filesize": 1024000,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

#### 2. List Documents
- **GET** `/documents`
- **Description**: Retrieve all uploaded documents
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "filename": "medical_report.pdf",
        "filepath": "uploads/medical_report_1234567890.pdf",
        "filesize": 1024000,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
  ```

#### 3. Download Document
- **GET** `/documents/:id`
- **Description**: Download a specific document by ID
- **Response**: File stream with appropriate headers
- **Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="filename.pdf"`

#### 4. Delete Document
- **DELETE** `/documents/:id`
- **Description**: Remove a document from the system
- **Response**:
  ```json
  {
    "success": true,
    "message": "File deleted successfully"
  }
  ```

## 🗄️ Database Schema

### Table: `documents`
| Column      | Type      | Constraints                    | Description                    |
|-------------|-----------|--------------------------------|--------------------------------|
| id          | INTEGER   | PRIMARY KEY AUTOINCREMENT     | Unique identifier              |
| filename    | TEXT      | NOT NULL                      | Original filename              |
| filepath    | TEXT      | NOT NULL                      | Path to stored file            |
| filesize    | INTEGER   | NOT NULL                      | File size in bytes             |
| created_at  | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP      | Upload timestamp               |

## 🔒 Security & Validation

### File Validation
- Only PDF files (`.pdf` extension) are allowed
- File size limit: 10MB (configurable)
- Filename sanitization to prevent path traversal attacks

### CORS Configuration
- Enabled for local development
- Allowed origins: `http://localhost:3000`

## 📁 File Storage Strategy

### Directory Structure
```
uploads/
├── document_1_timestamp.pdf
├── document_2_timestamp.pdf
└── ...
```

### Naming Convention
- Files are renamed to prevent conflicts
- Format: `original_name_timestamp.pdf`
- Timestamp ensures uniqueness

## 🚀 Development Assumptions

1. **Local Development**: Application runs on localhost only
2. **Single User**: No authentication system required
3. **PDF Only**: Only PDF files are supported
4. **File Persistence**: Files are stored locally, not in cloud storage
5. **No File Encryption**: Files are stored as-is for simplicity
6. **Synchronous Operations**: File operations are synchronous for simplicity
7. **Error Handling**: Basic error handling with user-friendly messages

## 🔧 Configuration

### Environment Variables
- `PORT`: Backend server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

### Ports
- **Frontend**: 3000
- **Backend**: 5001

## 📱 Frontend Features

### Components
1. **FileUpload**: Drag & drop or click to upload PDFs
2. **DocumentList**: Display all uploaded documents
3. **DocumentItem**: Individual document with actions
4. **Message**: Success/error notifications

### State Management
- React hooks for local state
- Axios for API communication
- Real-time updates after operations

### UI/UX
- Responsive design
- Loading states
- Success/error feedback
- File size formatting
- Date formatting
