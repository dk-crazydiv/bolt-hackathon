import { ChartQuestion, ParsedData } from '../../types'

export const chartQuestions: ChartQuestion[] = [
  {
    id: 'record-count-by-type',
    title: 'Record Count by Type',
    description: 'Shows the distribution of records across different data types',
    chartType: 'bar',
    dataSelector: (data: ParsedData) => {
      if (data.type === 'json') {
        const types: Record<string, number> = {}
        const items = Array.isArray(data.data) ? data.data : [data.data]
        
        items.forEach(item => {
          const type = typeof item === 'object' && item !== null 
            ? (item.type || item.kind || item.category || 'object')
            : typeof item
          types[type] = (types[type] || 0) + 1
        })
        
        return Object.entries(types).map(([type, count]) => ({
          type,
          count
        }))
      } else {
        // Takeout data
        return Object.entries(data.data).map(([fileName, content]) => ({
          type: fileName.replace('.json', ''),
          count: Array.isArray(content) ? content.length : 1
        }))
      }
    },
    xKey: 'type',
    yKey: 'count'
  },
  {
    id: 'data-size-distribution',
    title: 'Data Size Distribution',
    description: 'Shows the size distribution of different data files',
    chartType: 'pie',
    dataSelector: (data: ParsedData) => {
      if (data.type === 'takeout') {
        return Object.entries(data.data).map(([fileName, content]) => ({
          name: fileName.replace('.json', ''),
          value: JSON.stringify(content).length
        }))
      } else {
        return [{
          name: data.fileName,
          value: data.size
        }]
      }
    }
  },
  {
    id: 'timeline-analysis',
    title: 'Timeline Analysis',
    description: 'Shows data distribution over time (if timestamp fields are available)',
    chartType: 'line',
    dataSelector: (data: ParsedData) => {
      const items = data.type === 'json' 
        ? (Array.isArray(data.data) ? data.data : [data.data])
        : Object.values(data.data).flat()
      
      const timelineData: Record<string, number> = {}
      
      items.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          // Look for common timestamp fields
          const timestampFields = ['timestamp', 'date', 'created_at', 'time', 'createdAt']
          let timestamp = null
          
          for (const field of timestampFields) {
            if (item[field]) {
              timestamp = new Date(item[field])
              break
            }
          }
          
          if (timestamp && !isNaN(timestamp.getTime())) {
            const dateKey = timestamp.toISOString().split('T')[0] // YYYY-MM-DD
            timelineData[dateKey] = (timelineData[dateKey] || 0) + 1
          }
        }
      })
      
      return Object.entries(timelineData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date,
          count
        }))
    },
    xKey: 'date',
    yKey: 'count'
  }
]