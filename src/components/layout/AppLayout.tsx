import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Database, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { id: 'google-maps-timeline', name: 'Google Maps Timeline', path: '/google-maps-timeline' },
  { id: 'browser-history', name: 'Browser History', path: '/browser-history' },
  { id: 'youtube-history', name: 'Youtube History', path: '/youtube-history' },
  { id: 'playstore-apps', name: 'Playstore App installs', path: '/playstore-apps' },
  { id: 'fitbit-data', name: 'Fitbit data', path: '/fitbit-data' },
  { id: 'google-map-reviews', name: 'Google map reviews', path: '/google-map-reviews' },
]

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode } = useUIStore()
  const location = useLocation()

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Data Explorer</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/debug-json"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === '/debug-json'
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Bug className="h-4 w-4" />
                <span>Debug JSON</span>
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Top Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/google-maps-timeline' && location.pathname === '/')
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}