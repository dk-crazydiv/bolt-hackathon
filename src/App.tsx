import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { GoogleMapsTimelinePage } from './pages/GoogleMapsTimelinePage'
import { BrowserHistoryPage } from './pages/BrowserHistoryPage'
import { YoutubeHistoryPage } from './pages/YoutubeHistoryPage'
import { PlaystoreAppsPage } from './pages/PlaystoreAppsPage'
import { FitbitDataPage } from './pages/FitbitDataPage'
import { GoogleMapReviewsPage } from './pages/GoogleMapReviewsPage'
import { DebugJsonPage } from './pages/DebugJsonPage'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<GoogleMapsTimelinePage />} />
          <Route path="/google-maps-timeline" element={<GoogleMapsTimelinePage />} />
          <Route path="/browser-history" element={<BrowserHistoryPage />} />
          <Route path="/youtube-history" element={<YoutubeHistoryPage />} />
          <Route path="/playstore-apps" element={<PlaystoreAppsPage />} />
          <Route path="/fitbit-data" element={<FitbitDataPage />} />
          <Route path="/google-map-reviews" element={<GoogleMapReviewsPage />} />
          <Route path="/debug-json" element={<DebugJsonPage />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App