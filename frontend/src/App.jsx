import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import DocumentManager from './components/DocumentManager'

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<DocumentManager />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
