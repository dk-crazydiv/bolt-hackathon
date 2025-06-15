import React from 'react'
import { DropZone } from '@/components/DropZone'

export const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Data Explorer</h1>
          <p className="text-muted-foreground text-lg">
            Upload and explore large JSON files, Google Takeout archives, and other data formats with ease.
          </p>
        </div>
        
        <DropZone />
      </div>
    </div>
  )
}