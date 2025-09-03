const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Create documents table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    filesize INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

try {
  db.exec(createTableSQL);
  console.log('✅ Database initialized successfully');
  console.log('✅ Documents table created/verified');
  
  // Check if table is empty and add sample data for testing
  const count = db.prepare('SELECT COUNT(*) as count FROM documents').get();
  if (count.count === 0) {
    console.log('📝 Database is empty - ready for documents');
  } else {
    console.log(`📝 Database contains ${count.count} existing documents`);
  }
} catch (error) {
  console.error('❌ Error initializing database:', error.message);
} finally {
  db.close();
  console.log('🔒 Database connection closed');
}
