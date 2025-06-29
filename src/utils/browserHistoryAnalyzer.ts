// Enhanced browser history analyzer with comprehensive data handling and validation
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
    // Add validation for input data
    if (!data) {
      console.log('❌ No data provided to BrowserHistoryAnalyzer');
      this.visits = []
      return
    }
    
    console.log('🔍 === ENHANCED BROWSER HISTORY ANALYZER ===');
    console.log('🔍 BrowserHistoryAnalyzer constructor called with data:', {
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataKeys: data ? Object.keys(data) : 'null',
      dataLength: Array.isArray(data) ? data.length : 'not array'
    })
    
    // Add data size warning for very large datasets
    if (Array.isArray(data) && data.length > 100000) {
      console.log('⚠️ Large dataset detected:', data.length, 'records. Processing may take longer...')
    } else if (typeof data === 'object' && Object.keys(data).length > 50) {
      console.log('⚠️ Complex data structure detected with', Object.keys(data).length, 'top-level keys')
    }
    
    // Enhanced structure detection
    // Special handling for Browser History structure
    if (data && data["Browser History"]) {
      console.log('🌐 Browser History structure found:', typeof data["Browser History"])
      if (typeof data["Browser History"] === 'object' && !Array.isArray(data["Browser History"])) {
        console.log('🌐 Browser History nested structure detected')
        for (const [key, value] of Object.entries(data["Browser History"])) {
          console.log(`🌐   ${key}:`, Array.isArray(value) ? `Array[${value.length}]` : typeof value)
          if (Array.isArray(value) && value.length > 0) {
            console.log(`🌐     Sample item from ${key}:`, value[0])
          }
        }
      }
    }
    
    // More robust visit parsing
    this.visits = this.parseVisits(data)
    console.log('✅ Final parsed visits count:', this.visits.length)
    if (this.visits.length > 0) {
      console.log('✅ Sample visit with timestamp:', {
        url: this.visits[0].url,
        title: this.visits[0].title,
        timestamp: this.visits[0].timestamp,
        originalTime: this.visits[0].time_usec || this.visits[0].last_visit_time || this.visits[0].visitTime,
        parsedDate: new Date(this.visits[0].timestamp || 0),
        isValidDate: !isNaN(new Date(this.visits[0].timestamp || 0).getTime())
      })
    } else {
      console.log('❌ No visits were parsed from the data!')
    }
  }
  
  // Add method to validate if analyzer has usable data
  public hasValidData(): boolean {
    return this.visits.length > 0
  }
  
  // Add method to get data summary
  public getDataSummary() {
    return {
      totalVisits: this.visits.length,
      dateRange: this.visits.length > 0 ? {
        earliest: new Date(Math.min(...this.visits.map(v => v.timestamp || 0))),
        latest: new Date(Math.max(...this.visits.map(v => v.timestamp || 0)))
      } : null,
      uniqueUrls: new Set(this.visits.map(v => v.url)).size,
      uniqueDomains: new Set(this.visits.map(v => this.extractDomain(v.url))).size
    }
  }

  private parseVisits(data: any): ChromeVisit[] {
    console.log('🔍 === ENHANCED VISIT PARSING ===');
    if (!data) return []
    
    console.log('🔍 === PARSING VISITS DEBUG ===')
    console.log('🔍 Raw data type:', typeof data)
    
    // Add early validation
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.log('❌ Empty or null data provided')
      return []
    }
    console.log('🔍 Raw data keys:', Object.keys(data || {}))
    
    // Log a sample of the data structure without overwhelming the console
    // Better data structure logging
    if (Array.isArray(data)) {
      console.log('🔍 Data is array with length:', data.length)
      if (data.length > 0) {
        console.log('🔍 Sample array item:', data[0])
      }
    } else if (typeof data === 'object' && data !== null) {
      console.log('🔍 Data is object with keys:', Object.keys(data))
      // Show first few entries of each key
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`🔍   ${key}: Array[${value.length}]`, value.length > 0 ? value[0] : 'empty')
        } else {
          console.log(`🔍   ${key}:`, typeof value, Array.isArray(value) ? `Array[${value.length}]` : '')
        }
      })
    }
    
    // Enhanced data structure handling
    // Handle different data structures
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      visits = data
    } else if (data.visits && Array.isArray(data.visits)) {
      visits = data.visits
      console.log('🔍 Found visits in data.visits')
    } else if (data.data && Array.isArray(data.data)) {
      visits = data.data
    } else if (data["Browser History"] && Array.isArray(data["Browser History"])) {
      visits = data["Browser History"]
    } else if (data["Browser History"] && typeof data["Browser History"] === 'object') {
      const browserHistory = data["Browser History"]
      
      // More comprehensive nested search
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
    } else if (typeof data === 'object' && data !== null) {
      // Handle direct object with potential nested structure
      console.log('🔍 Searching object for visit arrays...')
      console.log('Checking object structure for visits...')
      
      // Check for common browser history patterns
      const possibleKeys = [
        'visits', 'history', 'browsing_history', 'browser_history',
        'urls', 'sites', 'pages', 'records', 'entries', 'items'
      ]
      
      // Enhanced key matching
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`Found visits array at key "${key}":`, data[key].length, 'items')
          visits = data[key]
          break
        }
      }
      
      // Better nested structure search
      // If no direct array found, look for nested structures
      if (visits.length === 0) {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            for (const nestedKey of possibleKeys) {
              if (value[nestedKey] && Array.isArray(value[nestedKey])) {
                console.log(`Found visits array at nested key "${key}.${nestedKey}":`, value[nestedKey].length, 'items')
                visits = value[nestedKey]
                break
              }
            }
            if (visits.length > 0) break
          }
        }
      }
    } else {
      // Enhanced deep search algorithm
      // Deep search for visits
      const findVisits = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes('history') || 
                key.toLowerCase().includes('visit') || 
                key.toLowerCase().includes('chrome') ||
                key.toLowerCase().includes('browser') ||
                key.toLowerCase().includes('url') ||
                key.toLowerCase().includes('site')) {
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

    console.log('🔍 === VISIT PROCESSING AND FILTERING ===');
    console.log('🔍 Raw visits found:', visits.length)
    if (visits.length > 0) {
      console.log('🔍 Sample raw visit:', visits[0])
      console.log('🔍 Time fields in sample:', {
        time_usec: visits[0].time_usec,
        last_visit_time: visits[0].last_visit_time,
        visit_time: visits[0].visit_time,
        visitTime: visits[0].visitTime,
        timestamp: visits[0].timestamp,
        date: visits[0].date
      })
    }

    // Enhanced visit processing with better field mapping
    const processedVisits = visits
      .filter(visit => {
        if (!visit || typeof visit !== 'object') {
          console.log('⚠️ Filtered out non-object visit:', visit)
          return false
        }
        return true
      })
      .map(visit => {
        // More comprehensive time field extraction
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
                         visit.when ||
                         visit.datetime ||
                         Date.now()
      
        // Enhanced field mapping
        const processedVisit = {
          url: visit.url || visit.URL || visit.uri || visit.href || visit.link || '',
          title: visit.title || visit.Title || visit.name || visit.page_title || visit.url || '',
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
      })
      .filter(visit => {
        // Better URL validation
        // Add more comprehensive URL validation
        if (!visit.url || typeof visit.url !== 'string') {
          console.log('⚠️ Filtered out visit with invalid URL type:', typeof visit.url)
          return false
        }
        
        const hasValidUrl = visit.url && (
          visit.url.startsWith('http') || 
          visit.url.startsWith('www') || 
          visit.url.includes('.') ||
          visit.url.length > 3
        )
        if (!hasValidUrl) {
          console.log('⚠️ Filtered out invalid URL:', visit.url)
        }
        return hasValidUrl
      })
      .filter(visit => {
        // Add timestamp validation
        if (!visit.timestamp || visit.timestamp <= 0 || isNaN(visit.timestamp)) {
          console.log('⚠️ Filtered out visit with invalid timestamp:', visit.timestamp)
          return false
        }
        return true
      })
    
    console.log('🔍 === FINAL PROCESSING RESULTS ===');
    console.log('✅ Final processed visits count:', processedVisits.length)
    if (processedVisits.length > 0) {
      console.log('✅ Sample processed visit:', processedVisits[0])
      console.log('✅ Timestamp validation for sample:', {
        originalTime: processedVisits[0].visitTime,
        parsedTimestamp: processedVisits[0].timestamp,
        resultingDate: new Date(processedVisits[0].timestamp),
        isValidDate: !isNaN(new Date(processedVisits[0].timestamp).getTime())
      })
    } else {
      console.log('❌ No visits passed the filtering process!')
    }
    
    // Add final validation summary
    console.log('📊 Processing summary:', {
      inputItems: visits.length,
      outputVisits: processedVisits.length,
      filteringEfficiency: visits.length > 0 ? ((processedVisits.length / visits.length) * 100).toFixed(1) + '%' : '0%'
    })
    return processedVisits
  }

  private parseTimestamp(time: any): number {
    console.log('🕐 === ENHANCED TIMESTAMP PARSING ===');
    if (typeof time === 'number') {
      // Handle Chrome timestamp (microseconds since January 1, 1601 UTC)
      if (time > 10000000000000) {
        // Convert Chrome timestamp to JavaScript timestamp
        // Chrome epoch: January 1, 1601 UTC to JavaScript epoch: January 1, 1970 UTC
        const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
        const jsTimestamp = Math.floor((time - CHROME_EPOCH_OFFSET) / 1000)
        // Validate the converted timestamp
        console.log('🕐 Chrome timestamp conversion:', {
          original: time,
          converted: jsTimestamp,
          date: new Date(jsTimestamp),
          isValid: !isNaN(new Date(jsTimestamp).getTime())
        })
        return jsTimestamp
      }
      // Handle Unix timestamp in milliseconds
      // Better timestamp validation
      if (time > 1000000000000) {
        console.log('🕐 Unix timestamp (ms):', {
          original: time,
          date: new Date(time),
          isValid: !isNaN(new Date(time).getTime())
        })
        return time
      }
      // Handle Unix timestamp in seconds
      // Enhanced second-to-millisecond conversion
      if (time > 1000000000) {
        const jsTimestamp = time * 1000
        console.log('🕐 Unix timestamp (s):', {
          original: time,
          converted: jsTimestamp,
          date: new Date(jsTimestamp),
          isValid: !isNaN(new Date(jsTimestamp).getTime())
        })
        return jsTimestamp
      }
      console.log('🕐 Small number timestamp:', {
        // Handle edge cases better
        original: time,
        assumingMs: time,
        date: new Date(time),
        isValid: !isNaN(new Date(time).getTime())
      })
      return time
    }
    if (typeof time === 'string') {
      // Better string parsing
      const parsed = new Date(time).getTime()
      console.log('🕐 String timestamp:', {
        original: time,
        parsed: parsed,
        date: new Date(parsed),
        isValid: !isNaN(parsed)
      })
      return isNaN(parsed) ? Date.now() : parsed
    }
    console.log('🕐 Fallback timestamp:', {
      // Enhanced fallback handling
      original: time,
      type: typeof time,
      fallback: Date.now()
    })
    return Date.now()
  }

  private extractDomain(url: string): string {
    // Enhanced domain extraction
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
      // Better error handling
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
    console.log('🔍 === ENHANCED ANALYSIS ENGINE ===');
    console.log('🔍 === STARTING ANALYSIS ===')
    
    // Add early validation
    if (!this.hasValidData()) {
      console.log('❌ No valid data available for analysis')
      return this.getEmptyAnalytics()
    }
    
    console.log('🔍 Total visits to analyze:', this.visits.length)
    
    if (this.visits.length === 0) {
      console.log('❌ No visits to analyze, returning empty analytics')
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
    
    // Add progress logging for large datasets
    const dataSize = this.visits.length
    if (dataSize > 10000) {
      console.log('🔍 Processing large dataset:', dataSize, 'visits. This may take a moment...')
    }
    
    // Enhanced sample logging
    console.log('🔍 Sample visits for analysis:', this.visits.slice(0, 2))
    console.log('🔍 Sample visit timestamps:', this.visits.slice(0, 2).map(v => ({
      url: v.url,
      timestamp: v.timestamp,
      date: new Date(v.timestamp || 0),
      isValidDate: !isNaN(new Date(v.timestamp || 0).getTime())
    })))
    
    // Add data summary
    const summary = this.getDataSummary()
    console.log('🔍 Data summary before analysis:', summary)
    
    // Analyze top domains
    console.log('🔍 === ENHANCED DOMAIN ANALYSIS ===');
    console.log('🔍 Starting domain analysis...')
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
    console.log('✅ Top domains analyzed:', topDomains.length, 'domains')

    // Analyze top sites
    console.log('🔍 === ENHANCED SITES ANALYSIS ===');
    console.log('🔍 Starting sites analysis...')
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
    console.log('✅ Top sites analyzed:', topSites.length, 'sites')

    // Analyze sessions
    console.log('🔍 === ENHANCED SESSION ANALYSIS ===');
    console.log('🔍 Starting session analysis...')
    const sessions = this.groupVisitsBySession(this.visits)
    console.log('✅ Sessions analyzed:', sessions.length, 'sessions')

    // Daily activity
    console.log('🔍 Starting daily activity analysis...')
    const dailyMap = new Map<string, { visits: number; duration: number }>()
    let validDailyEntries = 0
    this.visits.forEach(visit => {
      if (!visit.timestamp || visit.timestamp <= 0) {
        console.log('⚠️ Invalid timestamp for visit:', {
          url: visit.url,
          timestamp: visit.timestamp,
          originalTime: visit.time_usec || visit.last_visit_time || visit.visitTime
        })
        return
      }
      
      const visitDate = new Date(visit.timestamp)
      if (isNaN(visitDate.getTime())) {
        console.log('⚠️ Invalid date generated for visit:', {
          url: visit.url,
          timestamp: visit.timestamp,
          dateResult: visitDate
        })
        return
      }
      
      const date = visitDate.toISOString().split('T')[0]
      validDailyEntries++
      const existing = dailyMap.get(date) || { visits: 0, duration: 0 }
      existing.visits += visit.visitCount || 1
      existing.duration += visit.visitDuration || 0
      dailyMap.set(date, existing)
    })

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter(activity => {
        // Filter out invalid dates
        return activity.date && activity.date !== 'Invalid Date' && activity.visits > 0
      })
      
    console.log('📊 Daily activity processing summary:', { validDailyEntries, finalEntries: dailyActivity.length });
    console.log('📊 Daily activity generated:', dailyActivity.length, 'entries')
    console.log('📊 Sample daily activity:', dailyActivity.slice(0, 5))
    console.log('📊 Daily activity date range:', {
      first: dailyActivity[0]?.date,
      last: dailyActivity[dailyActivity.length - 1]?.date,
      totalDays: dailyActivity.length
    })

    // Hourly activity
    console.log('🔍 Starting hourly activity analysis...')
    let validHourlyEntries = 0
    const hourlyMap = new Map<number, { visits: number; totalDuration: number }>()
    this.visits.forEach(visit => {
      if (!visit.timestamp || visit.timestamp <= 0) return
      const visitDate = new Date(visit.timestamp)
      if (isNaN(visitDate.getTime())) return
      
      const hour = visitDate.getHours()
      if (isNaN(hour)) {
        console.log('⚠️ Invalid hour generated for visit:', {
          url: visit.url,
          timestamp: visit.timestamp,
          hour: hour
        })
        return
      }
      validHourlyEntries++
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
    
    console.log('📊 Hourly activity processing summary:', { validHourlyEntries, totalHours: 24 });
    console.log('📊 Hourly activity generated:', hourlyActivity.length, 'entries')
    console.log('📊 Sample hourly activity:', hourlyActivity.filter(h => h.visits > 0).slice(0, 5))
    console.log('📊 Total hourly visits:', hourlyActivity.reduce((sum, h) => sum + h.visits, 0))

    // Weekly pattern
    console.log('🔍 Starting weekly pattern analysis...')
    const weeklyMap = new Map<number, { visits: number; totalDuration: number }>()
    let validWeeklyEntries = 0
    this.visits.forEach(visit => {
      if (!visit.timestamp || visit.timestamp <= 0) return
      const visitDate = new Date(visit.timestamp)
      if (isNaN(visitDate.getTime())) return
      
      const dayOfWeek = visitDate.getDay()
      if (isNaN(dayOfWeek)) return
      validWeeklyEntries++
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
    
    console.log('📊 Weekly pattern processing summary:', { validWeeklyEntries, daysWithData: weeklyPattern.filter(w => w.visits > 0).length });
    console.log('📊 Weekly pattern generated:', weeklyPattern.filter(w => w.visits > 0))

    // New time-based analyses
    console.log('🔍 Starting advanced time-based analyses...')
    const timeBasedUrls = this.analyzeTimeBasedUrls()
    const hourlyUrlDistribution = this.analyzeHourlyUrlDistribution()
    const browsingSessions = this.analyzeBrowsingSessionsOverTime()

    // Calculate total stats
    console.log('🔍 === CALCULATING FINAL STATISTICS ===');
    const totalVisits = this.visits.reduce((sum, visit) => sum + (visit.visitCount || 1), 0)
    const totalSites = new Set(this.visits.map(v => v.url)).size
    const totalDomains = topDomains.length
    const avgVisitsPerSite = totalSites > 0 ? totalVisits / totalSites : 0
    const mostTypedSite = topSites.reduce((max, site) => 
      site.typedCount > max.typedCount ? site : max, 
      { typedCount: 0, url: 'None' }
    ).url

    console.log('🔍 === COMPILING ENHANCED RESULTS ===');
    console.log('🔍 Compiling final results...')
    const result = {
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
    
    console.log('✅ === ENHANCED ANALYSIS COMPLETE ===');
    console.log('✅ === ANALYSIS COMPLETE ===')
    console.log('✅ Final analysis result summary:', {
      dailyActivityCount: result.dailyActivity.length,
      hourlyActivityCount: result.hourlyActivity.length,
      hourlyActivityWithData: result.hourlyActivity.filter(h => h.visits > 0).length,
      weeklyPatternWithData: result.weeklyPattern.filter(w => w.visits > 0).length,
      totalVisits: result.totalStats.totalVisits,
      totalSites: result.totalStats.totalSites,
      topSitesCount: result.topSites.length,
      topDomainsCount: result.topDomains.length
    })
    
    return result
  }
  
  // Add helper method for empty analytics
  private getEmptyAnalytics(): BrowserAnalytics {
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
}