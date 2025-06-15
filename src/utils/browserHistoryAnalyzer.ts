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
    this.visits = this.parseVisits(data)
  }

  private parseVisits(data: any): ChromeVisit[] {
    if (!data) return []
    
    // Handle different data structures
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      visits = data
    } else if (data.visits && Array.isArray(data.visits)) {
      visits = data.visits
    } else if (data.data && Array.isArray(data.data)) {
      visits = data.data
    } else if (data.Browser && data.Browser.History && Array.isArray(data.Browser.History)) {
      visits = data.Browser.History
    } else if (data.History && Array.isArray(data.History)) {
      visits = data.History
    } else if (data.Browser_History && Array.isArray(data.Browser_History)) {
      visits = data.Browser_History
    } else if (data.chrome_visits && Array.isArray(data.chrome_visits)) {
      visits = data.chrome_visits
    } else {
      // Try to find visits in nested structure
      const findVisits = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes('history') || 
                key.toLowerCase().includes('visit') || 
                key.toLowerCase().includes('chrome') ||
                key.toLowerCase().includes('browser')) {
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
    }

    return visits.map(visit => {
      // Handle Chrome's specific timestamp format
      const visitTime = visit.last_visit_time || 
                       visit.visit_time || 
                       visit.visitTime || 
                       visit.timestamp || 
                       visit.time ||
                       visit.date ||
                       Date.now()
      
      return {
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
    }).filter(visit => visit.url && (visit.url.startsWith('http') || visit.url.startsWith('www')))
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
      console.log('Failed to parse URL:', url)
      return 'unknown'
    }
  }

  private groupVisitsBySession(visits: ChromeVisit[], sessionGapMinutes = 30): SessionData[] {
    if (visits.length === 0) return []

    const sortedVisits = [...visits].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    const sessions: SessionData[] = []
    let currentSession: ChromeVisit[] = [sortedVisits[0]]

    for (let i = 1; i < sortedVisits.length; i++) {
      const currentVisit = sortedVisits[i]
      const lastVisit = currentSession[currentSession.length - 1]
      const timeDiff = ((currentVisit.timestamp || 0) - (lastVisit.timestamp || 0)) / (1000 * 60) // minutes

      if (timeDiff <= sessionGapMinutes) {
        currentSession.push(currentVisit)
      } else {
        // End current session and start new one
        if (currentSession.length > 0) {
          sessions.push(this.createSessionData(currentSession))
        }
        currentSession = [currentVisit]
      }
    }

    // Add the last session
    if (currentSession.length > 0) {
      sessions.push(this.createSessionData(currentSession))
    }

    return sessions
  }

  private createSessionData(visits: ChromeVisit[]): SessionData {
    const startTime = new Date(visits[0].timestamp || 0)
    const endTime = new Date(visits[visits.length - 1].timestamp || 0)
    const duration = endTime.getTime() - startTime.getTime()

    return {
      startTime,
      endTime,
      duration: Math.max(duration, visits.length * 30000), // Minimum 30 seconds per page
      pageCount: visits.length,
      urls: visits.map(v => v.url)
    }
  }

  analyze(): BrowserAnalytics {
    console.log('Analyzing visits:', this.visits.length, 'visits')
    
    // Analyze top domains
    const domainMap = new Map<string, DomainStats>()
    
    this.visits.forEach(visit => {
      const domain = this.extractDomain(visit.url)
      if (domain === 'unknown') {
        console.log('Unknown domain for URL:', visit.url)
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