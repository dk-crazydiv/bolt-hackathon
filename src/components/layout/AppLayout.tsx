import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  Upload,
  BugReport,
  BarChart
} from '@mui/icons-material'
import { useUIStore } from '../../store/uiStore'
import { useDataStore } from '../../store/dataStore'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentTab, darkMode, setCurrentTab, toggleDarkMode } = useUIStore()
  const { currentFile } = useDataStore()

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              React Data Explorer
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="xl">
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab
                icon={<Upload />}
                label="Upload"
                iconPosition="start"
              />
              <Tab
                icon={<BugReport />}
                label="Debug JSON"
                iconPosition="start"
                disabled={!currentFile}
              />
              <Tab
                icon={<BarChart />}
                label="Charts"
                iconPosition="start"
                disabled={!currentFile}
              />
            </Tabs>
          </Container>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Container maxWidth="xl" sx={{ height: '100%' }}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}