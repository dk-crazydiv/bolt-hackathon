import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Database, Upload, FileJson, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

const dataTypes = [
  { id: 'google-takeout', name: 'Google Takeout', icon: Database },
  { id: 'generic-json', name: 'Generic JSON', icon: FileJson },
  { id: 'social-media', name: 'Social Media', icon: Upload },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
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

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              to="/"
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/' 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Data</span>
            </Link>
            
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Data Types
              </h3>
              {dataTypes.map((dataType) => {
                const Icon = dataType.icon
                const isActive = location.pathname === `/data/${dataType.id}`
                
                return (
                  <Link
                    key={dataType.id}
                    to={`/data/${dataType.id}`}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{dataType.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  )
}