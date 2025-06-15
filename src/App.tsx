import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { DataTypePage } from './pages/DataTypePage'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data/:dataType" element={<DataTypePage />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App