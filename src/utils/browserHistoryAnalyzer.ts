import { ParsedData } from '@/types'

export interface ChromeVisit {
  url: string
  title: string
  visitTime: string | number
  visitDuration?: number
  visitCount?: number
  timestamp?: number
  visit_time?: number
  last_visit_time?: number
  typed_count?: number
  visit_count?: number
  hidden?: number
  id?: number
}

export interface DomainStats {
  domain: string
  visitCount: number
  totalTime: number
  lastVisit: Date
  urls: string[]
  typedCount: number
}

export interface SessionData {
  startTime: Date
  endTime: Date
  duration: number
  pageCount: number
  urls: string[]
}

export interface BrowserAnalytics {
  topDomains: DomainStats[]
  topSites: { url: string; title: string; visitCount: number; domain: string; typedCount: number }[]
  sessions: SessionData[]
  dailyActivity: { date: string; visits: number; duration: number }[]
  hourlyActivity: { hour: number; visits: number; avgDuration: number }[]
  weeklyPattern: { day: string; visits: number; avgDuration: number }[]
  totalStats: {
    totalVisits: number
    totalSites: number
    totalDomains: number
    avgVisitsPerSite: number
    mostTypedSite: string
  }
}

export class BrowserHistoryAnalyzer {
  private visits: ChromeVisit[] = []

  constructor(data: any) {
    console.log('Raw data keys:', Object.keys(data || {}))
    console.log('Data structure preview:', data)
    console.log('Full data structure:', JSON.stringify(data, null, 2).slice(0, 2000))
    
    // Special handling for Browser History structure
    if (data && data["Browser History"]) {
      console.log('Browser History structure:', typeof data["Browser History"])
      console.log('Browser History keys:', Object.keys(data["Browser History"] || {}))
      console.log('Browser History content preview:', JSON.stringify(data["Browser History"], null, 2).slice(0, 1000))
      if (typeof data["Browser History"] === 'object' && !Array.isArray(data["Browser History"])) {
        console.log('Browser History nested structure detected')
        for (const [key, value] of Object.entries(data["Browser History"])) {
          console.log(`  ${key}:`, Array.isArray(value) ? `Array[${value.length}]` : typeof value)
          if (Array.isArray(value) && value.length > 0) {
            console.log(`    Sample item from ${key}:`, value[0])
          }
        }
      }
    }
    
    this.visits = this.parseVisits(data)
    console.log('Parsed visits count:', this.visits.length)
    if (this.visits.length > 0) {
      console.log('Sample visit:', this.visits[0])
    }
  }

  private parseVisits(data: any): ChromeVisit[] {
    if (!data) return []
    
    console.log('=== PARSING VISITS DEBUG ===')
    console.log('Input data type:', typeof data)
    console.log('Input data keys:', Object.keys(data || {}))
    
    // Handle different data structures
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      console.log('Data is array, length:', data.length)
      visits = data
    } else if (data.visits && Array.isArray(data.visits)) {
      console.log('Found data.visits array, length:', data.visits.length)
      visits = data.visits
    } else if (data.data && Array.isArray(data.data)) {
      console.log('Found data.data array, length:', data.data.length)
      visits = data.data
    } else if (data["Browser History"] && Array.isArray(data["Browser History"])) {
      console.log('Found Browser History array, length:', data["Browser History"].length)
      visits = data["Browser History"]
    } else if (data["Browser History"] && typeof data["Browser History"] === 'object') {
      console.log('Found Browser History object')
      // Handle nested Browser History object
      const browserHistory = data["Browser History"]
      console.log('Browser History keys:', Object.keys(browserHistory))
      
      if (Array.isArray(browserHistory.visits)) {
        console.log('Found browserHistory.visits array, length:', browserHistory.visits.length)
        visits = browserHistory.visits
      } else if (Array.isArray(browserHistory.data)) {
        console.log('Found browserHistory.data array, length:', browserHistory.data.length)
        visits = browserHistory.data
      } else if (Array.isArray(browserHistory.history)) {
        console.log('Found browserHistory.history array, length:', browserHistory.history.length)
        visits = browserHistory.history
      } else if (Array.isArray(browserHistory.History)) {
        console.log('Found browserHistory.History array, length:', browserHistory.History.length)
        visits = browserHistory.History
      } else if (Array.isArray(browserHistory.entries)) {
        console.log('Found browserHistory.entries array, length:', browserHistory.entries.length)
        visits = browserHistory.entries
      } else if (Array.isArray(browserHistory.items)) {
        console.log('Found browserHistory.items array, length:', browserHistory.items.length)
        visits = browserHistory.items
      } else {
        // Try to find any array in the Browser History object
        console.log('Searching for arrays in Browser History object...')
        for (const [key, value] of Object.entries(browserHistory)) {
          console.log(`Checking Browser History.${key}:`, Array.isArray(value) ? `Array[${value.length}]` : typeof value)
          if (Array.isArray(value) && value.length > 0) {
            console.log(`Found visits array in Browser History.${key}:`, value.length, 'items')
            console.log('Sample item:', value[0])
            visits = value
            break
          }
        }
        
        // If still no visits found, try to extract from nested objects
        if (visits.length === 0) {
          console.log('No direct arrays found, checking nested objects...')
          for (const [key, value] of Object.entries(browserHistory)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              console.log(`Checking nested object Browser History.${key}:`, Object.keys(value))
              for (const [nestedKey, nestedValue] of Object.entries(value)) {
                if (Array.isArray(nestedValue) && nestedValue.length > 0) {
                  console.log(`Found nested array in Browser History.${key}.${nestedKey}:`, nestedValue.length, 'items')
                  visits = nestedValue
                  break
                }
              }
              if (visits.length > 0) break
            }
          }
        }
      }
    } else if (data.Browser?.History && Array.isArray(data.Browser.History)) {
      console.log('Found data.Browser.History array, length:', data.Browser.History.length)
      visits = data.Browser.History
    } else if (data.History && Array.isArray(data.History)) {
      console.log('Found data.History array, length:', data.History.length)
      visits = data.History
    } else if (data.Browser_History && Array.isArray(data.Browser_History)) {
      console.log('Found data.Browser_History array, length:', data.Browser_History.length)
      visits = data.Browser_History
    } else if (data.chrome_visits && Array.isArray(data.chrome_visits)) {
      console.log('Found data.chrome_visits array, length:', data.chrome_visits.length)
      visits = data.chrome_visits
    } else {
      console.log('No standard structure found, performing deep search...')
      // Try to find visits in nested structure
      const findVisits = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes('history') || 
                key.toLowerCase().includes('visit') || 
                key.toLowerCase().includes('chrome') ||
                key.toLowerCase().includes('browser')) {
              console.log(`Checking key "${key}" for visits...`)
              const result = findVisits(value)
              if (result.length > 0) return result
            }
          }
          // Fallback: try all values
          for (const value of Object.values(obj)) {
            const result = findVisits(value)
            if (result.length > 0) return result
          }
        }
        return []
      }
      visits = findVisits(data)
      console.log('Deep search found:', visits.length, 'visits')
    }

    console.log('Raw visits found:', visits.length)
    if (visits.length > 0) {
      console.log('Sample raw visit:', visits[0])
      console.log('Visit keys:', Object.keys(visits[0] || {}))
      console.log('First 5 raw visits:', visits.slice(0, 5))
    } else {
      console.log('NO VISITS FOUND! Data structure might be different.')
      console.log('Full data dump:', JSON.stringify(data, null, 2))
    }

    const processedVisits = visits.filter(visit => visit && typeof visit === 'object').map(visit => {
      // Handle Chrome's specific timestamp format
      const visitTime = visit.last_visit_time || 
                       visit.visit_time || 
                       visit.visitTime || 
                       visit.timestamp || 
                       visit.time ||
                       visit.date ||
                       visit.lastVisitTime ||
                       visit.last_visit ||
                       visit.visit_date ||
                       visit.access_time ||
                       Date.now()
      
      const processedVisit = {
        url: visit.url || visit.URL || visit.uri || '',
        title: visit.title || visit.Title || visit.name || visit.url || '',
        visitTime: visitTime,
        visitDuration: visit.visitDuration || visit.duration || 0,
        visitCount: visit.visit_count || visit.visitCount || visit.count || 1,
        typedCount: visit.typed_count || visit.typedCount || visit.typed || 0,
        timestamp: this.parseTimestamp(visitTime),
        id: visit.id,
        hidden: visit.hidden
      }
      
      return processedVisit
    }).filter(visit => {
      const hasValidUrl = visit.url && (
        visit.url.startsWith('http') || 
        visit.url.startsWith('www') || 
        visit.url.includes('.')
      )
      if (!hasValidUrl) {
        console.log('Filtered out invalid URL:', visit.url)
      }
      return hasValidUrl
    })
    
    console.log('Final processed visits count:', processedVisits.length)
    if (processedVisits.length > 0) {
      console.log('Sample processed visits:', processedVisits.slice(0, 3))
    }
    
    return processedVisits
  }

  private parseTimestamp(time: any): number {
    if (typeof time === 'number') {
      // Handle Chrome timestamp (microseconds since January 1, 1601 UTC)
      if (time > 10000000000000) {
        // Convert Chrome timestamp to JavaScript timestamp
        // Chrome epoch: January 1, 1601 UTC
        // JavaScript epoch: January 1, 1970 UTC
        // Difference: 11644473600 seconds
        return Math.floor(time / 1000) - 11644473600000
      }
      // Handle Unix timestamp in milliseconds
      if (time > 1000000000000) {
        return time
      }
      // Handle Unix timestamp in seconds
      if (time > 1000000000) {
        return time * 1000
      }
      return time
    }
    if (typeof time === 'string') {
      const parsed = new Date(time).getTime()
      return isNaN(parsed) ? Date.now() : parsed
    }
    return Date.now()
  }

  private extractDomain(url: string): string {
    if (!url || typeof url !== 'string') {
      return 'unknown'
    }
    
    try {
      // Handle URLs without protocol
      if (!url.startsWith('http') && !url.startsWith('//')) {
        if (url.startsWith('www.')) {
          url = 'https://' + url
        } else if (url.includes('.')) {
          url = 'https://' + url
        } else {
          return 'unknown'
        }
      }
      
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return 'unknown'
    }
  }

  private groupVisitsBySession(visits: ChromeVisit[], sessionGapMinutes = 30): SessionData[] {
    if (visits.length === 0) return []

    // Sort visits by timestamp
    const sortedVisits = [...visits]
      .filter(visit => visit.timestamp && visit.timestamp > 0)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    
    console.log('Sorted visits for session analysis:', sortedVisits.length)
    if (sortedVisits.length === 0) return []
    
    const sessions: SessionData[] = []
    let currentSession: ChromeVisit[] = [sortedVisits[0]]

    for (let i = 1; i < sortedVisits.length; i++) {
      const currentVisit = sortedVisits[i]
      const lastVisit = currentSession[currentSession.length - 1]
      
      // Calculate time difference in minutes
      const timeDiffMs = (currentVisit.timestamp || 0) - (lastVisit.timestamp || 0)
      const timeDiffMinutes = timeDiffMs / (1000 * 60)
      
      console.log(`Visit ${i}: Time diff = ${timeDiffMinutes.toFixed(2)} minutes`)

      if (timeDiffMinutes <= sessionGapMinutes && timeDiffMinutes >= 0) {
        currentSession.push(currentVisit)
      } else {
        // End current session and start new one
        if (currentSession.length > 0) {
          console.log(`Creating session with ${currentSession.length} visits`)
          sessions.push(this.createSessionData(currentSession))
        }
        currentSession = [currentVisit]
      }
    }

    // Add the last session
    if (currentSession.length > 0) {
      console.log(`Creating final session with ${currentSession.length} visits`)
      sessions.push(this.createSessionData(currentSession))
    }

    console.log(`Total sessions created: ${sessions.length}`)
    return sessions
  }

  private createSessionData(visits: ChromeVisit[]): SessionData {
    if (visits.length === 0) {
      return {
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        pageCount: 0,
        urls: []
      }
    }
    
    const sortedVisits = visits.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    const startTime = new Date(sortedVisits[0].timestamp || 0)
    const endTime = new Date(sortedVisits[sortedVisits.length - 1].timestamp || 0)
    
    // Calculate actual duration or use minimum duration
    let duration = endTime.getTime() - startTime.getTime()
    
    // If duration is 0 or negative, estimate based on page count
    if (duration <= 0) {
      duration = visits.length * 60000 // 1 minute per page minimum
    }
    
    // Ensure minimum duration of 30 seconds per page
    const minDuration = visits.length * 30000
    duration = Math.max(duration, minDuration)

    return {
      startTime,
      endTime,
      duration,
      pageCount: visits.length,
      urls: visits.map(v => v.url).filter(url => url)
    }
  }

  analyze(): BrowserAnalytics {
    console.log('Analyzing visits:', this.visits.length, 'visits')
    
    if (this.visits.length === 0) {
      console.log('No visits to analyze, returning empty analytics')
      return {
        topDomains: [],
        topSites: [],
        sessions: [],
        dailyActivity: [],
        hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0, avgDuration: 0 })),
        weeklyPattern: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          .map(day => ({ day, visits: 0, avgDuration: 0 })),
        totalStats: {
          totalVisits: 0,
          totalSites: 0,
          totalDomains: 0,
          avgVisitsPerSite: 0,
          mostTypedSite: 'None'
        }
      }
    }
    
    // Analyze top domains
    const domainMap = new Map<string, DomainStats>()
    
    this.visits.forEach(visit => {
      const domain = this.extractDomain(visit.url)
      if (domain === 'unknown') {
        return
      }
      
      const existing = domainMap.get(domain) || {
        domain,
        visitCount: 0,
        totalTime: 0,
        lastVisit: new Date(0),
        urls: [],
        typedCount: 0
      }

      existing.visitCount += visit.visitCount || 1
      existing.totalTime += visit.visitDuration || 0
      existing.typedCount += visit.typedCount || 0
      existing.lastVisit = new Date(Math.max(existing.lastVisit.getTime(), visit.timestamp || 0))
      if (!existing.urls.includes(visit.url)) {
        existing.urls.push(visit.url)
      }

      domainMap.set(domain, existing)
    })

    const topDomains = Array.from(domainMap.values())
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 20)
    
    console.log('Top domains found:', topDomains.length, topDomains.slice(0, 5))

    // Analyze top sites
    const siteMap = new Map<string, { url: string; title: string; visitCount: number; domain: string; typedCount: number }>()
    
    this.visits.forEach(visit => {
      const existing = siteMap.get(visit.url) || {
        url: visit.url,
        title: visit.title,
        visitCount: 0,
        domain: this.extractDomain(visit.url),
        typedCount: 0
      }
      existing.visitCount += visit.visitCount || 1
      existing.typedCount += visit.typedCount || 0
      siteMap.set(visit.url, existing)
    })

    const topSites = Array.from(siteMap.values())
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 20)

    // Analyze sessions
    const sessions = this.groupVisitsBySession(this.visits)

    // Daily activity
    const dailyMap = new Map<string, { visits: number; duration: number }>()
    this.visits.forEach(visit => {
      const date = new Date(visit.timestamp || 0).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { visits: 0, duration: 0 }
      existing.visits += visit.visitCount || 1
      existing.duration += visit.visitDuration || 0
      dailyMap.set(date, existing)
    })

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Hourly activity
    const hourlyMap = new Map<number, { visits: number; totalDuration: number }>()
    this.visits.forEach(visit => {
      const hour = new Date(visit.timestamp || 0).getHours()
      const existing = hourlyMap.get(hour) || { visits: 0, totalDuration: 0 }
      existing.visits += visit.visitCount || 1
      existing.totalDuration += visit.visitDuration || 0
      hourlyMap.set(hour, existing)
    })

    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const stats = hourlyMap.get(hour) || { visits: 0, totalDuration: 0 }
      return {
        hour,
        visits: stats.visits,
        avgDuration: stats.visits > 0 ? stats.totalDuration / stats.visits : 0
      }
    })

    // Weekly pattern
    const weeklyMap = new Map<number, { visits: number; totalDuration: number }>()
    this.visits.forEach(visit => {
      const dayOfWeek = new Date(visit.timestamp || 0).getDay()
      const existing = weeklyMap.get(dayOfWeek) || { visits: 0, totalDuration: 0 }
      existing.visits += visit.visitCount || 1
      existing.totalDuration += visit.visitDuration || 0
      weeklyMap.set(dayOfWeek, existing)
    })

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyPattern = dayNames.map((day, index) => {
      const stats = weeklyMap.get(index) || { visits: 0, totalDuration: 0 }
      return {
        day,
        visits: stats.visits,
        avgDuration: stats.visits > 0 ? stats.totalDuration / stats.visits : 0
      }
    })

    // Calculate total stats
    const totalVisits = this.visits.reduce((sum, visit) => sum + (visit.visitCount || 1), 0)
    const totalSites = new Set(this.visits.map(v => v.url)).size
    const totalDomains = topDomains.length
    const avgVisitsPerSite = totalSites > 0 ? totalVisits / totalSites : 0
    const mostTypedSite = topSites.reduce((max, site) => 
      site.typedCount > max.typedCount ? site : max, 
      { typedCount: 0, url: 'None' }
    ).url

    return {
      topDomains,
      topSites,
      sessions,
      dailyActivity,
      hourlyActivity,
      weeklyPattern,
      totalStats: {
        totalVisits,
        totalSites,
        totalDomains,
        avgVisitsPerSite,
        mostTypedSite
      }
    }
  }
}