import React, { useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Alert
} from '@mui/material'
import { Search } from '@mui/icons-material'
import ReactJson from 'react-json-view'
import { useDataStore } from '../../store/dataStore'
import { useUIStore } from '../../store/uiStore'

interface JsonItemProps {
  index: number
  style: React.CSSProperties
  data: {
    items: any[]
    searchTerm: string
    darkMode: boolean
  }
}

const JsonItem: React.FC<JsonItemProps> = ({ index, style, data }) => {
  const { items, searchTerm, darkMode } = data
  const item = items[index]

  if (!item) return null

  const itemString = JSON.stringify(item).toLowerCase()
  const matchesSearch = !searchTerm || itemString.includes(searchTerm.toLowerCase())

  if (!matchesSearch) return null

  return (
    <div style={style}>
      <Paper sx={{ m: 1, p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Record {index + 1}
        </Typography>
        <ReactJson
          src={item}
          theme={darkMode ? 'monokai' : 'rjv-default'}
          collapsed={2}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={false}
          name={false}
        />
      </Paper>
    </div>
  )
}

export const JsonDebugView: React.FC = () => {
  const { currentFile } = useDataStore()
  const { darkMode } = useUIStore()
  const [searchTerm, setSearchTerm] = React.useState('')

  const flattenedData = useMemo(() => {
    if (!currentFile) return []

    if (currentFile.type === 'json') {
      return Array.isArray(currentFile.data) ? currentFile.data : [currentFile.data]
    } else {
      // Flatten takeout data
      const flattened: any[] = []
      for (const [fileName, content] of Object.entries(currentFile.data)) {
        if (Array.isArray(content)) {
          flattened.push(...content.map(item => ({ _fileName: fileName, ...item })))
        } else {
          flattened.push({ _fileName: fileName, ...content })
        }
      }
      return flattened
    }
  }, [currentFile])

  const filteredData = useMemo(() => {
    if (!searchTerm) return flattenedData
    return flattenedData.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [flattenedData, searchTerm])

  if (!currentFile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No file selected. Please upload a file first.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Debug JSON View
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Chip 
            label={`${currentFile.metadata.totalRecords.toLocaleString()} records`}
            color="primary"
            size="small"
          />
          <Chip 
            label={currentFile.type.toUpperCase()}
            color="secondary"
            size="small"
          />
          <Chip 
            label={`${(currentFile.size / 1024 / 1024).toFixed(1)} MB`}
            size="small"
          />
        </Box>
        <TextField
          fullWidth
          placeholder="Search in JSON data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Paper sx={{ flex: 1, overflow: 'hidden' }}>
        {filteredData.length > 0 ? (
          <List
            height={600}
            itemCount={filteredData.length}
            itemSize={200}
            itemData={{
              items: filteredData,
              searchTerm,
              darkMode
            }}
          >
            {JsonItem}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No records match your search' : 'No data to display'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}