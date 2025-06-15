import { ParsedData } from '@/types'

export interface DeviceInfo {
  cache_guid: string
  device_type: string
  device_form_factor: string
  manufacturer: string
  model: string
  client_name: string
  chrome_version: string
  os_type: string
  last_updated_timestamp: number
}

export interface DeviceVisit {
  url: string
  title: string
  visitTime: number
  device_guid: string
  deviceType: 'mobile' | 'tablet' | 'laptop' | 'unknown'
  deviceName: string
  manufacturer: string
  model: string
}

export interface DeviceStats {
  device_guid: string
  deviceName: string
  deviceType: 'mobile' | 'tablet' | 'laptop' | 'unknown'
  manufacturer: string
  model: string
  totalVisits: number
  uniqueUrls: number
  topDomains: { domain: string; visits: number }[]
  hourlyActivity: { hour: number; visits: number }[]
  dailyActivity: { date: string; visits: number }[]
  lastActive: Date
  firstActive: Date
  avgSessionLength: number
  peakUsageHour: number
  mostVisitedSite: string
}

export interface DeviceComparison {
  deviceType: 'mobile' | 'tablet' | 'laptop'
  totalDevices: number
  totalVisits: number
  avgVisitsPerDevice: number
  topSites: { url: string; visits: number }[]
  usagePatterns: {
    peakHours: number[]
    weekdayVsWeekend: { weekday: number; weekend: number }
    sessionLengths: { short: number; medium: number; long: number }
  }
}

export class DeviceAnalyzer {
  private devices: DeviceInfo[] = []
  private visits: any[] = []

  constructor(deviceData: any, browserData: any) {
    this.devices = this.parseDevices(deviceData)
    this.visits = this.parseBrowserHistory(browserData)
    console.log('🔍 DeviceAnalyzer initialized:', {
      devices: this.devices.length,
      visits: this.visits.length
    })
  }

  private parseDevices(data: any): DeviceInfo[] {
    console.log('📱 Parsing device data:', data)
    
    if (!data) return []
    
    let deviceArray: any[] = []
    
    // Handle different data structures
    if (Array.isArray(data)) {
      deviceArray = data
    } else if (data["Device Info"] && Array.isArray(data["Device Info"])) {
      deviceArray = data["Device Info"]
    } else if (data.devices && Array.isArray(data.devices)) {
      deviceArray = data.devices
    } else if (typeof data === 'object') {
      // Look for arrays in the object
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.length > 0) {
          const sample = value[0]
          if (sample && (sample.cache_guid || sample.device_type || sample.manufacturer)) {
            deviceArray = value
            break
          }
        }
      }
    }

    return deviceArray.map(device => ({
      cache_guid: device.cache_guid || device.cacheGuid || '',
      device_type: device.device_type || device.deviceType || 'unknown',
      device_form_factor: device.device_form_factor || device.deviceFormFactor || 'unknown',
      manufacturer: device.manufacturer || 'Unknown',
      model: device.model || 'Unknown',
      client_name: device.client_name || device.clientName || 'Unknown',
      chrome_version: device.chrome_version || device.chromeVersion || 'Unknown',
      os_type: device.os_type || device.osType || 'unknown',
      last_updated_timestamp: device.last_updated_timestamp || device.lastUpdatedTimestamp || 0
    }))
  }

  private parseBrowserHistory(data: any): any[] {
    if (!data) return []
    
    // Use similar logic as BrowserHistoryAnalyzer
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      visits = data
    } else if (data["Browser History"]) {
      const browserHistory = data["Browser History"]
      if (Array.isArray(browserHistory)) {
        visits = browserHistory
      } else if (typeof browserHistory === 'object') {
        for (const [key, value] of Object.entries(browserHistory)) {
          if (Array.isArray(value) && value.length > 0) {
            visits = value
            break
          }
        }
      }
    }

    return visits.filter(visit => visit && visit.url)
  }

  private categorizeDeviceType(device: DeviceInfo): 'mobile' | 'tablet' | 'laptop' | 'unknown' {
    const formFactor = device.device_form_factor.toLowerCase()
    const deviceType = device.device_type.toLowerCase()
    const osType = device.os_type.toLowerCase()

    // Check form factor first
    if (formFactor.includes('phone') || formFactor.includes('mobile')) {
      return 'mobile'
    }
    if (formFactor.includes('tablet')) {
      return 'tablet'
    }
    if (formFactor.includes('desktop') || formFactor.includes('laptop')) {
      return 'laptop'
    }

    // Check device type
    if (deviceType.includes('phone') || deviceType.includes('mobile')) {
      return 'mobile'
    }
    if (deviceType.includes('tablet')) {
      return 'tablet'
    }
    if (deviceType.includes('mac') || deviceType.includes('windows') || deviceType.includes('linux')) {
      return 'laptop'
    }

    // Check OS type
    if (osType.includes('ios') || osType.includes('android')) {
      return osType.includes('tablet') ? 'tablet' : 'mobile'
    }
    if (osType.includes('mac') || osType.includes('windows') || osType.includes('linux')) {
      return 'laptop'
    }

    return 'unknown'
  }

  private extractDomain(url: string): string {
    try {
      if (!url.startsWith('http')) {
        url = 'https://' + url
      }
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return 'unknown'
    }
  }

  private parseTimestamp(time: any): number {
    if (typeof time === 'number') {
      if (time > 10000000000000) {
        // Chrome timestamp
        const CHROME_EPOCH_OFFSET = 11644473600000000
        return Math.floor((time - CHROME_EPOCH_OFFSET) / 1000)
      }
      if (time > 1000000000000) return time
      if (time > 1000000000) return time * 1000
      return time
    }
    if (typeof time === 'string') {
      const parsed = new Date(time).getTime()
      return isNaN(parsed) ? Date.now() : parsed
    }
    return Date.now()
  }

  analyzeDeviceUsage(): {
    deviceStats: DeviceStats[]
    deviceComparison: DeviceComparison[]
    crossDevicePatterns: {
      sharedSites: { url: string; devices: string[]; totalVisits: number }[]
      deviceSwitchingPatterns: { fromDevice: string; toDevice: string; frequency: number }[]
      timeBasedUsage: { hour: number; mobile: number; tablet: number; laptop: number }[]
    }
  } {
    console.log('🔍 Analyzing device usage patterns...')

    // Create device stats
    const deviceStats: DeviceStats[] = this.devices.map(device => {
      const deviceType = this.categorizeDeviceType(device)
      
      // For now, we'll simulate device-specific visits since we don't have cache_guid in browser history
      // In a real implementation, you'd match visits by cache_guid or device identifier
      const deviceVisits = this.visits.filter((_, index) => {
        // Simulate device distribution based on device type
        const deviceIndex = this.devices.findIndex(d => d.cache_guid === device.cache_guid)
        return index % this.devices.length === deviceIndex
      })

      const domains = new Map<string, number>()
      const hourlyActivity = new Array(24).fill(0)
      const dailyActivity = new Map<string, number>()
      
      let totalVisits = 0
      let firstActive = new Date()
      let lastActive = new Date(0)

      deviceVisits.forEach(visit => {
        const timestamp = this.parseTimestamp(visit.time_usec || visit.last_visit_time || visit.visitTime)
        const visitDate = new Date(timestamp)
        const domain = this.extractDomain(visit.url)
        const hour = visitDate.getHours()
        const dateStr = visitDate.toISOString().split('T')[0]

        domains.set(domain, (domains.get(domain) || 0) + 1)
        hourlyActivity[hour]++
        dailyActivity.set(dateStr, (dailyActivity.get(dateStr) || 0) + 1)
        
        totalVisits++
        if (visitDate < firstActive) firstActive = visitDate
        if (visitDate > lastActive) lastActive = visitDate
      })

      const topDomains = Array.from(domains.entries())
        .map(([domain, visits]) => ({ domain, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)

      const peakUsageHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
      const mostVisitedSite = topDomains[0]?.domain || 'None'

      return {
        device_guid: device.cache_guid,
        deviceName: device.client_name || `${device.manufacturer} ${device.model}`,
        deviceType,
        manufacturer: device.manufacturer,
        model: device.model,
        totalVisits,
        uniqueUrls: new Set(deviceVisits.map(v => v.url)).size,
        topDomains,
        hourlyActivity: hourlyActivity.map((visits, hour) => ({ hour, visits })),
        dailyActivity: Array.from(dailyActivity.entries()).map(([date, visits]) => ({ date, visits })),
        lastActive,
        firstActive,
        avgSessionLength: totalVisits > 0 ? 30 : 0, // Simplified calculation
        peakUsageHour,
        mostVisitedSite
      }
    })

    // Create device type comparison
    const deviceTypeMap = new Map<'mobile' | 'tablet' | 'laptop', DeviceStats[]>()
    deviceStats.forEach(stats => {
      if (stats.deviceType !== 'unknown') {
        const existing = deviceTypeMap.get(stats.deviceType) || []
        existing.push(stats)
        deviceTypeMap.set(stats.deviceType, existing)
      }
    })

    const deviceComparison: DeviceComparison[] = Array.from(deviceTypeMap.entries()).map(([deviceType, devices]) => {
      const totalVisits = devices.reduce((sum, d) => sum + d.totalVisits, 0)
      const allSites = new Map<string, number>()
      
      devices.forEach(device => {
        device.topDomains.forEach(({ domain, visits }) => {
          allSites.set(domain, (allSites.get(domain) || 0) + visits)
        })
      })

      const topSites = Array.from(allSites.entries())
        .map(([url, visits]) => ({ url, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10)

      // Calculate usage patterns
      const hourlyUsage = new Array(24).fill(0)
      let weekdayVisits = 0
      let weekendVisits = 0

      devices.forEach(device => {
        device.hourlyActivity.forEach(({ hour, visits }) => {
          hourlyUsage[hour] += visits
        })
        device.dailyActivity.forEach(({ date, visits }) => {
          const dayOfWeek = new Date(date).getDay()
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendVisits += visits
          } else {
            weekdayVisits += visits
          }
        })
      })

      const peakHours = hourlyUsage
        .map((visits, hour) => ({ hour, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 3)
        .map(({ hour }) => hour)

      return {
        deviceType,
        totalDevices: devices.length,
        totalVisits,
        avgVisitsPerDevice: devices.length > 0 ? totalVisits / devices.length : 0,
        topSites,
        usagePatterns: {
          peakHours,
          weekdayVsWeekend: { weekday: weekdayVisits, weekend: weekendVisits },
          sessionLengths: { short: 0, medium: 0, long: 0 } // Simplified
        }
      }
    })

    // Cross-device patterns
    const sharedSites = new Map<string, Set<string>>()
    deviceStats.forEach(device => {
      device.topDomains.forEach(({ domain }) => {
        if (!sharedSites.has(domain)) {
          sharedSites.set(domain, new Set())
        }
        sharedSites.get(domain)!.add(device.device_guid)
      })
    })

    const crossDeviceSharedSites = Array.from(sharedSites.entries())
      .filter(([_, devices]) => devices.size > 1)
      .map(([url, devices]) => ({
        url,
        devices: Array.from(devices),
        totalVisits: deviceStats
          .filter(d => devices.has(d.device_guid))
          .reduce((sum, d) => sum + (d.topDomains.find(td => td.domain === url)?.visits || 0), 0)
      }))
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, 10)

    // Time-based usage across device types
    const timeBasedUsage = new Array(24).fill(null).map((_, hour) => ({
      hour,
      mobile: 0,
      tablet: 0,
      laptop: 0
    }))

    deviceStats.forEach(device => {
      device.hourlyActivity.forEach(({ hour, visits }) => {
        if (device.deviceType !== 'unknown') {
          timeBasedUsage[hour][device.deviceType] += visits
        }
      })
    })

    return {
      deviceStats,
      deviceComparison,
      crossDevicePatterns: {
        sharedSites: crossDeviceSharedSites,
        deviceSwitchingPatterns: [], // Simplified for now
        timeBasedUsage
      }
    }
  }
}