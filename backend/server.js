const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
let db;

try {
  db = new Database(dbPath);
  console.log('✅ Connected to SQLite database');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    const filename = `${originalName}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Patient Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Check for duplicate files
app.post('/documents/check-duplicate', (req, res) => {
  try {
    const { filename, filesize } = req.body;
    
    if (!filename || !filesize) {
      return res.status(400).json({
        success: false,
        message: 'Filename and filesize are required'
      });
    }
    
    const duplicateCheckStmt = db.prepare(`
      SELECT id, filename, filesize, created_at FROM documents 
      WHERE filename = ? OR filesize = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    const duplicate = duplicateCheckStmt.get(filename, filesize);
    
    if (duplicate) {
      return res.json({
        success: true,
        isDuplicate: true,
        duplicate: {
          id: duplicate.id,
          filename: duplicate.filename,
          filesize: duplicate.filesize,
          uploadedAt: duplicate.created_at
        }
      });
    }
    
    return res.json({
      success: true,
      isDuplicate: false
    });
    
  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking for duplicates',
      error: error.message
    });
  }
});

// Upload document
app.post('/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, filename, path: filepath, size } = req.file;
    
    // Check for duplicate files
    const duplicateCheckStmt = db.prepare(`
      SELECT id, filename, created_at FROM documents 
      WHERE filename = ? OR filesize = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    const duplicate = duplicateCheckStmt.get(originalname, size);
    
    if (duplicate) {
      // Clean up the uploaded file since it's a duplicate
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      
      return res.status(409).json({
        success: false,
        message: 'File already exists in database',
        duplicate: {
          id: duplicate.id,
          filename: duplicate.filename,
          uploadedAt: duplicate.created_at
        }
      });
    }
    
    // Save document metadata to database
    const stmt = db.prepare(`
      INSERT INTO documents (filename, filepath, filesize) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(originalname, filepath, size);
    
    const document = {
      id: result.lastInsertRowid,
      filename: originalname,
      filepath: filepath,
      filesize: size,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Get all documents
app.get('/documents', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM documents ORDER BY created_at DESC');
    const documents = stmt.all();
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
});

// Download document
app.get('/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    const document = stmt.get(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const filePath = path.resolve(document.filepath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Delete document
app.delete('/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document info first
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    const document = stmt.get(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from disk
    const filePath = path.resolve(document.filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    const deleteStmt = db.prepare('DELETE FROM documents WHERE id = ?');
    deleteStmt.run(id);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Patient Portal API running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🗄️ Database: ${dbPath}`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (db) {
    db.close();
    console.log('🔒 Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  if (db) {
    db.close();
    console.log('🔒 Database connection closed');
  }
  process.exit(0);
});
