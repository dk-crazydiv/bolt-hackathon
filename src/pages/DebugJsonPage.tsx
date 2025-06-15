import React from 'react'
import { useLocation } from 'react-router-dom'
import { JsonDebugView } from '@/components/JsonDebugView/JsonDebugView'
import { useDataStore } from '@/store/dataStore'

export const DebugJsonPage: React.FC = () => {
  const location = useLocation()
  const { debugJsonData } = useDataStore()
  
  // Get data from navigation state or from debug storage
  const data = location.state?.data || debugJsonData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Debug JSON View</h1>
        <p className="text-muted-foreground text-lg">
          Explore and debug your JSON data with advanced navigation and search capabilities.
        </p>
      </div>
      
      <JsonDebugView data={data} />
    </div>
  )
}