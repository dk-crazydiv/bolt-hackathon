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
      visits: this.visits.length,
      deviceSample: this.devices[0],
      visitSample: this.visits[0]
    })
  }

  private parseDevices(data: any): DeviceInfo[] {
    console.log('📱 Parsing device data:', data)
    console.log('📱 Device data type:', typeof data)
    console.log('📱 Device data is array:', Array.isArray(data))
    
    if (!data) return []
    
    let deviceArray: any[] = []
    
    // Handle different data structures
    if (Array.isArray(data)) {
      console.log('📱 Data is already an array')
      deviceArray = data
    } else if (data["Device Info"] && Array.isArray(data["Device Info"])) {
      console.log('📱 Found Device Info array')
      deviceArray = data["Device Info"]
    } else if (data.deviceInfo && Array.isArray(data.deviceInfo)) {
      console.log('📱 Found deviceInfo array')
      deviceArray = data.deviceInfo
    } else if (data.devices && Array.isArray(data.devices)) {
      console.log('📱 Found devices array')
      deviceArray = data.devices
    } else if (typeof data === 'object') {
      console.log('📱 Searching object for device arrays...')
      // Look for arrays in the object
      for (const [key, value] of Object.entries(data)) {
        console.log(`📱 Checking key "${key}":`, Array.isArray(value) ? `Array[${value.length}]` : typeof value)
        if (Array.isArray(value) && value.length > 0) {
          const sample = value[0]
          console.log(`📱 Sample from ${key}:`, sample)
          if (sample && (sample.cache_guid || sample.device_type || sample.manufacturer)) {
            console.log(`📱 Found device array at key "${key}":`, value.length, 'devices')
            deviceArray = value
            break
          }
        }
      }
    }

    console.log('📱 Final device array length:', deviceArray.length)
    if (deviceArray.length > 0) {
      console.log('📱 Sample device:', deviceArray[0])
    }

    const parsedDevices = deviceArray.map((device, index) => {
      const parsed = {
      cache_guid: device.cache_guid || device.cacheGuid || '',
      device_type: device.device_type || device.deviceType || 'unknown',
      device_form_factor: device.device_form_factor || device.deviceFormFactor || 'unknown',
      manufacturer: device.manufacturer || 'Unknown',
      model: device.model || 'Unknown',
      client_name: device.client_name || device.clientName || 'Unknown',
      chrome_version: device.chrome_version || device.chromeVersion || 'Unknown',
      os_type: device.os_type || device.osType || 'unknown',
      last_updated_timestamp: device.last_updated_timestamp || device.lastUpdatedTimestamp || 0
      }
      
      console.log(`📱 Parsed device ${index + 1}:`, {
        manufacturer: parsed.manufacturer,
        model: parsed.model,
        device_type: parsed.device_type,
        device_form_factor: parsed.device_form_factor,
        os_type: parsed.os_type,
        client_name: parsed.client_name
      })
      
      return parsed
    })
    
    console.log('📱 Parsed devices:', parsedDevices.length, 'devices')
    
    return parsedDevices
  }

  private parseBrowserHistory(data: any): any[] {
    console.log('🌐 Parsing browser history data:', typeof data, Array.isArray(data))
    if (!data) return []
    
    // Use similar logic as BrowserHistoryAnalyzer
    let visits: any[] = []
    
    if (Array.isArray(data)) {
      console.log('🌐 Browser data is already an array')
      visits = data
    } else if (data["Browser History"]) {
      console.log('🌐 Found Browser History key')
      const browserHistory = data["Browser History"]
      if (Array.isArray(browserHistory)) {
        console.log('🌐 Browser History is array')
        visits = browserHistory
      } else if (typeof browserHistory === 'object') {
        console.log('🌐 Browser History is object, searching for arrays...')
        for (const [key, value] of Object.entries(browserHistory)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`🌐 Found visits array in Browser History.${key}`)
            visits = value
            break
          }
        }
      }
    } else if (typeof data === 'object') {
      console.log('🌐 Searching object for visit arrays...')
      // Look for common visit patterns
      const possibleKeys = ['visits', 'history', 'browsing_history', 'browser_history', 'urls', 'sites', 'pages']
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`🌐 Found visits array at key "${key}"`)
          visits = data[key]
          break
        }
      }
    }

    const filteredVisits = visits.filter(visit => visit && visit.url)
    console.log('🌐 Filtered visits:', filteredVisits.length, 'visits')
    return filteredVisits
  }

  private categorizeDeviceType(device: DeviceInfo): 'mobile' | 'tablet' | 'laptop' | 'unknown' {
    const formFactor = (device.device_form_factor || '').toLowerCase()
    const deviceType = (device.device_type || '').toLowerCase()
    const osType = (device.os_type || '').toLowerCase()
    const manufacturer = (device.manufacturer || '').toLowerCase()
    const model = (device.model || '').toLowerCase()
    const clientName = (device.client_name || '').toLowerCase()

    console.log('🔍 Categorizing device:', {
      formFactor,
      deviceType,
      osType,
      manufacturer,
      model,
      clientName
    })

    // Check form factor first (most reliable)
    if (formFactor.includes('phone') || formFactor.includes('mobile') || formFactor === 'device_form_factor_phone') {
      return 'mobile'
    }
    if (formFactor.includes('tablet') || formFactor === 'device_form_factor_tablet') {
      return 'tablet'
    }
    if (formFactor.includes('desktop') || formFactor.includes('laptop') || formFactor === 'device_form_factor_desktop') {
      return 'laptop'
    }

    // Check device type (second priority)
    if (deviceType.includes('phone') || deviceType.includes('mobile') || deviceType === 'type_phone') {
      return 'mobile'
    }
    if (deviceType.includes('tablet') || deviceType === 'type_tablet') {
      return 'tablet'
    }
    if (deviceType.includes('mac') || deviceType.includes('windows') || deviceType.includes('linux') || deviceType === 'type_mac') {
      return 'laptop'
    }

    // Check OS type (third priority)
    if (osType.includes('ios') || osType === 'os_type_ios') {
      // iOS devices - check model to distinguish iPhone vs iPad
      if (model.includes('ipad') || clientName.includes('ipad')) {
        return 'tablet'
      }
      if (model.includes('iphone') || clientName.includes('iphone')) {
        return 'mobile'
      }
      // Default iOS to mobile if unclear
      return 'mobile'
    }
    if (osType.includes('android') || osType === 'os_type_android') {
      // Android devices - check model/manufacturer for tablets
      if (model.includes('tablet') || clientName.includes('tablet') || 
          manufacturer.includes('tablet') || formFactor.includes('tablet')) {
        return 'tablet'
      }
      return 'mobile'
    }
    if (osType.includes('mac') || osType.includes('windows') || osType.includes('linux') || 
        osType === 'os_type_mac' || osType === 'os_type_windows' || osType === 'os_type_linux') {
      return 'laptop'
    }

    // Check manufacturer and model patterns
    if (manufacturer.includes('apple')) {
      if (model.includes('iphone') || clientName.includes('iphone')) {
        return 'mobile'
      }
      if (model.includes('ipad') || clientName.includes('ipad')) {
        return 'tablet'
      }
      if (model.includes('mac') || clientName.includes('mac')) {
        return 'laptop'
      }
    }
    
    if (manufacturer.includes('samsung') || manufacturer.includes('google') || 
        manufacturer.includes('xiaomi') || manufacturer.includes('huawei')) {
      // Android manufacturers - default to mobile unless tablet indicators
      if (model.includes('tablet') || model.includes('tab ') || clientName.includes('tablet')) {
        return 'tablet'
      }
      return 'mobile'
    }

    console.log('⚠️ Could not categorize device, defaulting to unknown:', device)
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
    console.log('📊 Available devices:', this.devices.length)
    console.log('📊 Available visits:', this.visits.length)
    
    if (this.devices.length === 0) {
      console.log('❌ No devices to analyze')
      return {
        deviceStats: [],
        deviceComparison: [],
        crossDevicePatterns: {
          sharedSites: [],
          deviceSwitchingPatterns: [],
          timeBasedUsage: Array.from({ length: 24 }, (_, hour) => ({ hour, mobile: 0, tablet: 0, laptop: 0 }))
        }
      }
    }
    
    if (this.visits.length === 0) {
      console.log('❌ No visits to analyze')
      // Return basic device info without visit data
      const deviceStats: DeviceStats[] = this.devices.map(device => ({
        device_guid: device.cache_guid,
        deviceName: device.client_name || `${device.manufacturer} ${device.model}`,
        deviceType: this.categorizeDeviceType(device),
        manufacturer: device.manufacturer,
        model: device.model,
        totalVisits: 0,
        uniqueUrls: 0,
        topDomains: [],
        hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({ hour, visits: 0 })),
        dailyActivity: [],
        lastActive: new Date(device.last_updated_timestamp || Date.now()),
        firstActive: new Date(device.last_updated_timestamp || Date.now()),
        avgSessionLength: 0,
        peakUsageHour: 0,
        mostVisitedSite: 'None'
      }))
      
      return {
        deviceStats,
        deviceComparison: [],
        crossDevicePatterns: {
          sharedSites: [],
          deviceSwitchingPatterns: [],
          timeBasedUsage: Array.from({ length: 24 }, (_, hour) => ({ hour, mobile: 0, tablet: 0, laptop: 0 }))
        }
      }
    }

    // Create device stats
    const deviceStats: DeviceStats[] = this.devices.map(device => {
      const deviceType = this.categorizeDeviceType(device)
      
      console.log(`📱 Device "${device.client_name}" categorized as: ${deviceType}`)
      
      // For now, we'll simulate device-specific visits since we don't have cache_guid in browser history
      // In a real implementation, you'd match visits by cache_guid or device identifier
      const deviceVisits = this.visits.filter((_, index) => {
        // Simulate device distribution based on device type
        const deviceIndex = this.devices.findIndex(d => d.cache_guid === device.cache_guid)
        return index % this.devices.length === deviceIndex
      })

      console.log(`📱 Device "${device.client_name}" assigned ${deviceVisits.length} visits`)
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