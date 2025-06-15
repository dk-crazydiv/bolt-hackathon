import { ParsedData } from '@/types'

export interface ChromeVisit {
  url: string
  title: string
  visitTime: string | number
  visitDuration?: number
  visitCount?: number
  timestamp?: number
}

export interface DomainStats {
  domain: string
  visitCount: number
  totalTime: number
  lastVisit: Date
  urls: string[]
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
  topSites: { url: string; title: string; visitCount: number; domain: string }[]
  sessions: SessionData[]
  dailyActivity: { date: string; visits: number; duration: number }[]
  hourlyActivity: { hour: number; visits: number; avgDuration: number }[]
  weeklyPattern: { day: string; visits: number; avgDuration: number }[]
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
    } else {
      // Try to find visits in nested structure
      const findVisits = (obj: any): any[] => {
        if (Array.isArray(obj)) return obj
        if (typeof obj === 'object' && obj !== null) {
          for (const value of Object.values(obj)) {
            const result = findVisits(value)
            if (result.length > 0) return result
          }
        }
        return []
      }
      visits = findVisits(data)
    }

    return visits.map(visit => ({
      url: visit.url || visit.URL || '',
      title: visit.title || visit.Title || visit.url || '',
      visitTime: visit.visitTime || visit.visit_time || visit.timestamp || visit.time || Date.now(),
      visitDuration: visit.visitDuration || visit.duration || 0,
      visitCount: visit.visitCount || visit.visit_count || 1,
      timestamp: this.parseTimestamp(visit.visitTime || visit.visit_time || visit.timestamp || visit.time)
    })).filter(visit => visit.url && visit.url.startsWith('http'))
  }

  private parseTimestamp(time: any): number {
    if (typeof time === 'number') {
      // Handle Chrome timestamp (microseconds since 1601)
      if (time > 10000000000000) {
        return (time / 1000) - 11644473600000
      }
      return time
    }
    if (typeof time === 'string') {
      return new Date(time).getTime()
    }
    return Date.now()
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
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
      duration,
      pageCount: visits.length,
      urls: visits.map(v => v.url)
    }
  }

  analyze(): BrowserAnalytics {
    // Analyze top domains
    const domainMap = new Map<string, DomainStats>()
    
    this.visits.forEach(visit => {
      const domain = this.extractDomain(visit.url)
      const existing = domainMap.get(domain) || {
        domain,
        visitCount: 0,
        totalTime: 0,
        lastVisit: new Date(0),
        urls: []
      }

      existing.visitCount += visit.visitCount || 1
      existing.totalTime += visit.visitDuration || 0
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
    const siteMap = new Map<string, { url: string; title: string; visitCount: number; domain: string }>()
    
    this.visits.forEach(visit => {
      const existing = siteMap.get(visit.url) || {
        url: visit.url,
        title: visit.title,
        visitCount: 0,
        domain: this.extractDomain(visit.url)
      }
      existing.visitCount += visit.visitCount || 1
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
      existing.visits += 1
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
      existing.visits += 1
      existing.totalDuration += visit.visitDuration || 0
      hourlyMap.set(hour, existing)
    })

    const hourlyActivity = Array.from(hourlyMap.entries())
      .map(([hour, stats]) => ({
        hour,
        visits: stats.visits,
        avgDuration: stats.visits > 0 ? stats.totalDuration / stats.visits : 0
      }))
      .sort((a, b) => a.hour - b.hour)

    // Weekly pattern
    const weeklyMap = new Map<number, { visits: number; totalDuration: number }>()
    this.visits.forEach(visit => {
      const dayOfWeek = new Date(visit.timestamp || 0).getDay()
      const existing = weeklyMap.get(dayOfWeek) || { visits: 0, totalDuration: 0 }
      existing.visits += 1
      existing.totalDuration += visit.visitDuration || 0
      weeklyMap.set(dayOfWeek, existing)
    })

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyPattern = Array.from(weeklyMap.entries())
      .map(([dayNum, stats]) => ({
        day: dayNames[dayNum],
        visits: stats.visits,
        avgDuration: stats.visits > 0 ? stats.totalDuration / stats.visits : 0
      }))
      .sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day))

    return {
      topDomains,
      topSites,
      sessions,
      dailyActivity,
      hourlyActivity,
      weeklyPattern
    }
  }
}