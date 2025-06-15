import React from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Button,
  Alert,
  Chip
} from '@mui/material'
import {
  CloudUpload,
  Cancel,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useFileParser } from '../hooks/useFileParser'
import { useDataStore } from '../store/dataStore'

export const DropZone: React.FC = () => {
  const { parseFile, cancelParsing } = useFileParser()
  const { parseProgress, isLoading } = useDataStore()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/json': ['.json'],
      'text/json': ['.json']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0])
      }
    }
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Explorer
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload large Google Takeout ZIP files or JSON files to explore and visualize your data
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="ZIP files" size="small" />
          <Chip label="JSON files" size="small" />
          <Chip label="Large files (100MB+)" size="small" />
        </Box>
      </Paper>

      {parseProgress && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {parseProgress.status === 'parsing' && (
                <CloudUpload sx={{ mr: 1, color: 'primary.main' }} />
              )}
              {parseProgress.status === 'complete' && (
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              )}
              {parseProgress.status === 'error' && (
                <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
              )}
              <Typography variant="h6">
                {parseProgress.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                {formatFileSize(parseProgress.totalSize)}
              </Typography>
            </Box>

            {parseProgress.status === 'parsing' && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={parseProgress.progress}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {parseProgress.recordsProcessed.toLocaleString()} records processed
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={cancelParsing}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            )}

            {parseProgress.status === 'complete' && (
              <Alert severity="success">
                Successfully parsed {parseProgress.recordsProcessed.toLocaleString()} records
              </Alert>
            )}

            {parseProgress.status === 'error' && (
              <Alert severity="error">
                {parseProgress.error}
              </Alert>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  )
}