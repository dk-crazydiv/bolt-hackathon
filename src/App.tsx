import React from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { DropZone } from './components/DropZone'
import { JsonDebugView } from './components/JsonDebugView/JsonDebugView'
import { ChartView } from './components/Charts/ChartView'
import { useUIStore } from './store/uiStore'

function App() {
  const { currentTab } = useUIStore()

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <DropZone />
      case 1:
        return <JsonDebugView />
      case 2:
        return <ChartView />
      default:
        return <DropZone />
    }
  }

  return (
    <AppLayout>
      {renderTabContent()}
    </AppLayout>
  )
}

export default App