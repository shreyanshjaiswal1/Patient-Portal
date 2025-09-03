# 🏥 Patient Portal - Medical Document Management

A secure and user-friendly patient portal application for managing medical documents. Built with React frontend and Node.js backend, featuring PDF upload, download, and management capabilities.

## ✨ Features

- 📄 **PDF Upload**: Drag & drop or click to upload medical documents
- 📋 **Document Management**: View all uploaded documents with metadata
- 📥 **Download**: Download documents with original filenames
- 🗑️ **Delete**: Remove documents with confirmation
- 🔒 **Security**: PDF-only uploads with size validation
- 📱 **Responsive**: Modern, mobile-friendly interface
- ⚡ **Fast**: Built with Vite for optimal performance

## 🏗️ Architecture

```
📦 Patient Portal
├── 🎨 Frontend (React + Vite)
│   ├── File upload with drag & drop
│   ├── Document list with actions
│   └── Responsive UI components
├── 🚀 Backend (Node.js + Express)
│   ├── RESTful API endpoints
│   ├── File upload handling (Multer)
│   └── SQLite database integration
├── 🗄️ Database (SQLite)
│   └── Documents metadata storage
└── 📁 File Storage
    └── Local uploads directory
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreyanshjaiswal1/Patient-Portal.git
   cd Patient-Portal
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Initialize database**
   ```bash
   cd ../backend
   npm run init-db
   ```

### Running the Application

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5001

2. **Start the frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on: http://localhost:3000

3. **Open your browser**
   Navigate to: http://localhost:3000

## 🔌 API Endpoints

### Base URL
```
http://localhost:5001
```

### Endpoints

#### 1. Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data

Body: file (PDF file)
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5001/documents/upload \
  -F "file=@/path/to/document.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "filename": "medical_report.pdf",
    "filepath": "uploads/medical_report_1705312200000.pdf",
    "filesize": 1024000,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. List Documents
```http
GET /documents
```

**Example (cURL):**
```bash
curl http://localhost:5001/documents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "medical_report.pdf",
      "filepath": "uploads/medical_report_1705312200000.pdf",
      "filesize": 1024000,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 3. Download Document
```http
GET /documents/:id
```

**Example (cURL):**
```bash
curl -O -J http://localhost:5001/documents/1
```

#### 4. Delete Document
```http
DELETE /documents/:id
```

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5001/documents/1
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### 5. Health Check
```http
GET /health
```

**Example (cURL):**
```bash
curl http://localhost:5001/health
```

## 🗄️ Database Schema

### Table: `documents`
| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | INTEGER   | Primary key, auto-increment    |
| filename    | TEXT      | Original filename              |
| filepath    | TEXT      | Path to stored file            |
| filesize    | INTEGER   | File size in bytes             |
| created_at  | TIMESTAMP | Upload timestamp               |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

### File Size Limits
- **Default**: 10MB (10,485,760 bytes)
- **Configurable**: Via `MAX_FILE_SIZE` environment variable

## 📁 Project Structure

```
📦 Patient Portal
├── 📂 backend/
│   ├── 📄 package.json
│   ├── 📄 server.js
│   ├── 📄 init-db.js
│   └── 📄 database.sqlite
├── 📂 frontend/
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 index.html
│   └── 📂 src/
│       ├── 📄 main.jsx
│       ├── 📄 App.jsx
│       ├── 📄 index.css
│       ├── 📂 components/
│       │   ├── 📄 Header.jsx
│       │   ├── 📄 DocumentManager.jsx
│       │   ├── 📄 FileUpload.jsx
│       │   ├── 📄 DocumentList.jsx
│       │   ├── 📄 DocumentItem.jsx
│       │   └── 📄 Message.jsx
│       └── 📂 services/
│           └── 📄 api.js
├── 📂 uploads/
├── 📄 design.md
└── 📄 README.md
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Start Vite dev server
```

### Database Management
```bash
cd backend
npm run init-db  # Initialize/reset database
```

## 🧪 Testing

### Manual Testing
1. Upload a PDF file (drag & drop or click)
2. Verify file appears in the document list
3. Download the file and verify it opens correctly
4. Delete the file and confirm removal

### API Testing
Use the provided cURL examples or import into Postman:
- **Postman Collection**: Available in the project root
- **Health Check**: Test API availability
- **File Operations**: Test upload, download, delete

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5001
   lsof -ti:5001 | xargs kill -9
   
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection failed**
   ```bash
   cd backend
   npm run init-db
   ```

3. **CORS errors**
   - Ensure backend is running on port 5001
   - Check `FRONTEND_URL` in backend environment

4. **File upload fails**
   - Verify file is PDF format
   - Check file size (max 10MB)
   - Ensure uploads directory exists

### Logs
- **Backend**: Check terminal running `npm run dev`
- **Frontend**: Check browser console and terminal
- **Database**: SQLite database file in `backend/` directory

## 🔒 Security Features

- **File Type Validation**: Only PDF files allowed
- **File Size Limits**: Configurable maximum file size
- **Path Traversal Protection**: Secure file storage
- **CORS Configuration**: Restricted to frontend origin
- **Input Sanitization**: Safe filename handling

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the design document (`design.md`)
3. Check browser console for errors
4. Verify both frontend and backend are running

---

**Happy Document Management! 🎉**
