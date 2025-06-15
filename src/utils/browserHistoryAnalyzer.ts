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
  time_usec?: number
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

export interface TimeBasedUrlStats {
  url: string
  title: string
  domain: string
  visitsByHour: { [hour: number]: number }
  visitsByDayOfWeek: { [day: number]: number }
  totalVisits: number
  peakHour: number
  peakDay: string
}

export interface BrowserAnalytics {
  topDomains: DomainStats[]
  topSites: { url: string; title: string; visitCount: number; domain: string; typedCount: number }[]
  sessions: SessionData[]
  dailyActivity: { date: string; visits: number; duration: number }[]
  hourlyActivity: { hour: number; visits: number; avgDuration: number }[]
  weeklyPattern: { day: string; visits: number; avgDuration: number }[]
  timeBasedUrls: TimeBasedUrlStats[]
  hourlyUrlDistribution: { hour: number; topUrls: { url: string; title: string; visits: number }[] }[]
  browsingSessions: { date: string; sessions: number; avgSessionLength: number }[]
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
    
    // Special handling for Browser History structure
    if (data && data["Browser History"]) {
      console.log('Browser History structure:', typeof data["Browser History"])
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
      console.log('Sample visit with timestamp:', {
        url: this.visits[0].url,
        timestamp: this.visits[0].timestamp,
        originalTime: this.visits[0].time_usec || this.visits[0].last_visit_time,
        parsedDate: new Date(this.visits[0].timestamp || 0)
      })
    }
  }

  private parseVisits(data: any): ChromeVisit[] {
    if (!data) return []
    
    console.log('=== PARSING VISITS DEBUG ===')
    
    // Handle different data structures
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      visits = data
    } else if (data.visits && Array.isArray(data.visits)) {
      visits = data.visits
    } else if (data.data && Array.isArray(data.data)) {
      visits = data.data
    } else if (data["Browser History"] && Array.isArray(data["Browser History"])) {
      visits = data["Browser History"]
    } else if (data["Browser History"] && typeof data["Browser History"] === 'object') {
      const browserHistory = data["Browser History"]
      
      if (Array.isArray(browserHistory.visits)) {
        visits = browserHistory.visits
      } else if (Array.isArray(browserHistory.data)) {
        visits = browserHistory.data
      } else if (Array.isArray(browserHistory.history)) {
        visits = browserHistory.history
      } else if (Array.isArray(browserHistory.History)) {
        visits = browserHistory.History
      } else if (Array.isArray(browserHistory.entries)) {
        visits = browserHistory.entries
      } else if (Array.isArray(browserHistory.items)) {
        visits = browserHistory.items
      } else {
        // Try to find any array in the Browser History object
        for (const [key, value] of Object.entries(browserHistory)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`Found visits array in Browser History.${key}:`, value.length, 'items')
            visits = value
            break
          }
        }
      }
    } else {
      // Deep search for visits
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
          for (const value of Object.values(obj)) {
            const result = findVisits(value)
            if (result.length > 0) return result
          }
        }
        return []
      }
      visits = findVisits(data)
    }

    console.log('Raw visits found:', visits.length)
    if (visits.length > 0) {
      console.log('Sample raw visit:', visits[0])
      console.log('Time fields in sample:', {
        time_usec: visits[0].time_usec,
        last_visit_time: visits[0].last_visit_time,
        visit_time: visits[0].visit_time,
        visitTime: visits[0].visitTime
      })
    }

    const processedVisits = visits.filter(visit => visit && typeof visit === 'object').map(visit => {
      // Prioritize time_usec as it's the actual visit time
      const visitTime = visit.time_usec || 
                       visit.last_visit_time || 
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
        hidden: visit.hidden,
        time_usec: visit.time_usec
      }
      
      return processedVisit
    }).filter(visit => {
      const hasValidUrl = visit.url && (
        visit.url.startsWith('http') || 
        visit.url.startsWith('www') || 
        visit.url.includes('.')
      )
      return hasValidUrl
    })
    
    console.log('Final processed visits count:', processedVisits.length)
    return processedVisits
  }

  private parseTimestamp(time: any): number {
    if (typeof time === 'number') {
      // Handle Chrome timestamp (microseconds since January 1, 1601 UTC)
      if (time > 10000000000000) {
        // Convert Chrome timestamp to JavaScript timestamp
        // Chrome epoch: January 1, 1601 UTC to JavaScript epoch: January 1, 1970 UTC
        const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
        return Math.floor((time - CHROME_EPOCH_OFFSET) / 1000)
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

  private analyzeTimeBasedUrls(): TimeBasedUrlStats[] {
    const urlTimeMap = new Map<string, {
      url: string
      title: string
      domain: string
      visitsByHour: { [hour: number]: number }
      visitsByDayOfWeek: { [day: number]: number }
      totalVisits: number
    }>()

    this.visits.forEach(visit => {
      const visitDate = new Date(visit.timestamp || 0)
      const hour = visitDate.getHours()
      const dayOfWeek = visitDate.getDay()
      
      const existing = urlTimeMap.get(visit.url) || {
        url: visit.url,
        title: visit.title,
        domain: this.extractDomain(visit.url),
        visitsByHour: {},
        visitsByDayOfWeek: {},
        totalVisits: 0
      }

      existing.visitsByHour[hour] = (existing.visitsByHour[hour] || 0) + 1
      existing.visitsByDayOfWeek[dayOfWeek] = (existing.visitsByDayOfWeek[dayOfWeek] || 0) + 1
      existing.totalVisits += 1

      urlTimeMap.set(visit.url, existing)
    })

    return Array.from(urlTimeMap.values())
      .filter(stats => stats.totalVisits > 1) // Only include URLs visited more than once
      .map(stats => {
        // Find peak hour and day
        const peakHour = Object.entries(stats.visitsByHour)
          .reduce((max, [hour, visits]) => visits > max.visits ? { hour: parseInt(hour), visits } : max, { hour: 0, visits: 0 }).hour
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const peakDayIndex = Object.entries(stats.visitsByDayOfWeek)
          .reduce((max, [day, visits]) => visits > max.visits ? { day: parseInt(day), visits } : max, { day: 0, visits: 0 }).day
        
        return {
          ...stats,
          peakHour,
          peakDay: dayNames[peakDayIndex]
        }
      })
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, 20) // Top 20 URLs by visit count
  }

  private analyzeHourlyUrlDistribution(): { hour: number; topUrls: { url: string; title: string; visits: number }[] }[] {
    const hourlyUrlMap = new Map<number, Map<string, { url: string; title: string; visits: number }>>()

    this.visits.forEach(visit => {
      const hour = new Date(visit.timestamp || 0).getHours()
      
      if (!hourlyUrlMap.has(hour)) {
        hourlyUrlMap.set(hour, new Map())
      }
      
      const hourMap = hourlyUrlMap.get(hour)!
      const existing = hourMap.get(visit.url) || { url: visit.url, title: visit.title, visits: 0 }
      existing.visits += 1
      hourMap.set(visit.url, existing)
    })

    return Array.from({ length: 24 }, (_, hour) => {
      const hourMap = hourlyUrlMap.get(hour) || new Map()
      const topUrls = Array.from(hourMap.values())
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5) // Top 5 URLs per hour
      
      return { hour, topUrls }
    })
  }

  private groupVisitsBySession(visits: ChromeVisit[], sessionGapMinutes = 30): SessionData[] {
    if (visits.length === 0) return []

    // Sort visits by timestamp
    const sortedVisits = [...visits]
      .filter(visit => visit.timestamp && visit.timestamp > 0)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    
    if (sortedVisits.length === 0) return []
    
    const sessions: SessionData[] = []
    let currentSession: ChromeVisit[] = [sortedVisits[0]]

    for (let i = 1; i < sortedVisits.length; i++) {
      const currentVisit = sortedVisits[i]
      const lastVisit = currentSession[currentSession.length - 1]
      
      // Calculate time difference in minutes
      const timeDiffMs = (currentVisit.timestamp || 0) - (lastVisit.timestamp || 0)
      const timeDiffMinutes = timeDiffMs / (1000 * 60)

      if (timeDiffMinutes <= sessionGapMinutes && timeDiffMinutes >= 0) {
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
    
    // Calculate actual duration
    let duration = endTime.getTime() - startTime.getTime()
    
    // If duration is 0 or very small, estimate based on page count
    if (duration < 60000) { // Less than 1 minute
      duration = Math.max(visits.length * 30000, 60000) // At least 30 seconds per page, minimum 1 minute
    }

    return {
      startTime,
      endTime,
      duration,
      pageCount: visits.length,
      urls: visits.map(v => v.url).filter(url => url)
    }
  }

  private analyzeBrowsingSessionsOverTime(): { date: string; sessions: number; avgSessionLength: number }[] {
    const sessions = this.groupVisitsBySession(this.visits)
    const dailySessionMap = new Map<string, { sessions: number; totalDuration: number }>()

    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0]
      const existing = dailySessionMap.get(date) || { sessions: 0, totalDuration: 0 }
      existing.sessions += 1
      existing.totalDuration += session.duration
      dailySessionMap.set(date, existing)
    })

    return Array.from(dailySessionMap.entries())
      .map(([date, stats]) => ({
        date,
        sessions: stats.sessions,
        avgSessionLength: stats.sessions > 0 ? stats.totalDuration / stats.sessions : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  analyze(): BrowserAnalytics {
    console.log('Analyzing visits:', this.visits.length, 'visits')
    
    if (this.visits.length === 0) {
      return {
        topDomains: [],
        topSites: [],
        sessions: [],
        dailyActivity: [],
        hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0, avgDuration: 0 })),
        weeklyPattern: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          .map(day => ({ day, visits: 0, avgDuration: 0 })),
        timeBasedUrls: [],
        hourlyUrlDistribution: [],
        browsingSessions: [],
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
      if (domain === 'unknown') return
      
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

    // New time-based analyses
    const timeBasedUrls = this.analyzeTimeBasedUrls()
    const hourlyUrlDistribution = this.analyzeHourlyUrlDistribution()
    const browsingSessions = this.analyzeBrowsingSessionsOverTime()

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
      timeBasedUrls,
      hourlyUrlDistribution,
      browsingSessions,
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