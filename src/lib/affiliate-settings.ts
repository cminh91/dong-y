import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default settings
export const DEFAULT_AFFILIATE_SETTINGS = {
  commissions: {
    defaultRate: 0.15,
    level1Rate: 0.15,
    level2Rate: 0.05,
    minWithdrawal: 100000,  // Giảm từ 500k xuống 100k
    withdrawalFee: 5000,    // Giảm từ 50k xuống 5k
    paymentSchedule: 'weekly'
  },
  registration: {
    autoApproval: false,
    requireVerification: true,
    welcomeBonus: 100000,
    referralBonus: 50000
  },
  links: {
    linkExpiry: 365,
    maxLinksPerUser: 50,
    trackingCookieDuration: 30,
    allowCustomSlugs: true
  },
  notifications: {
    emailNotifications: true,
    newRegistrationAlert: true,
    withdrawalRequestAlert: true,
    commissionAlert: false
  },
  security: {
    requireTwoFactor: false,
    sessionTimeout: 60,
    ipWhitelist: '',
    fraudDetection: true
  }
}

// Cache for settings to avoid frequent DB queries
let settingsCache: { [key: string]: any } = {}
let cacheExpiry: { [key: string]: number } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get a specific affiliate setting
 */
export async function getAffiliateSetting(key: string, defaultValue?: any): Promise<any> {
  const cacheKey = `affiliate_${key}`
  
  // Check cache first
  if (settingsCache[cacheKey] && cacheExpiry[cacheKey] > Date.now()) {
    return settingsCache[cacheKey]
  }

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: cacheKey }
    })

    const value = setting ? setting.value : (defaultValue || DEFAULT_AFFILIATE_SETTINGS[key as keyof typeof DEFAULT_AFFILIATE_SETTINGS])
    
    // Update cache
    settingsCache[cacheKey] = value
    cacheExpiry[cacheKey] = Date.now() + CACHE_DURATION
    
    return value
  } catch (error) {
    console.error(`Error getting affiliate setting ${key}:`, error)
    return defaultValue || DEFAULT_AFFILIATE_SETTINGS[key as keyof typeof DEFAULT_AFFILIATE_SETTINGS]
  }
}

/**
 * Get commission settings
 */
export async function getCommissionSettings() {
  return await getAffiliateSetting('commissions', DEFAULT_AFFILIATE_SETTINGS.commissions)
}

/**
 * Get registration settings
 */
export async function getRegistrationSettings() {
  return await getAffiliateSetting('registration', DEFAULT_AFFILIATE_SETTINGS.registration)
}

/**
 * Get links settings
 */
export async function getLinksSettings() {
  return await getAffiliateSetting('links', DEFAULT_AFFILIATE_SETTINGS.links)
}

/**
 * Get notification settings
 */
export async function getNotificationSettings() {
  return await getAffiliateSetting('notifications', DEFAULT_AFFILIATE_SETTINGS.notifications)
}

/**
 * Get security settings
 */
export async function getSecuritySettings() {
  return await getAffiliateSetting('security', DEFAULT_AFFILIATE_SETTINGS.security)
}

/**
 * Clear settings cache
 */
export function clearSettingsCache() {
  settingsCache = {}
  cacheExpiry = {}
}

/**
 * Calculate commission based on settings
 */
export async function calculateCommission(orderValue: number, affiliateLevel: number = 1): Promise<number> {
  const commissionSettings = await getCommissionSettings()
  
  let rate = commissionSettings.defaultRate
  if (affiliateLevel === 1) {
    rate = commissionSettings.level1Rate
  } else if (affiliateLevel === 2) {
    rate = commissionSettings.level2Rate
  }
  
  return orderValue * rate
}

/**
 * Check if withdrawal amount is valid
 */
export async function validateWithdrawalAmount(amount: number): Promise<{ valid: boolean; message?: string }> {
  const commissionSettings = await getCommissionSettings()
  
  if (amount < commissionSettings.minWithdrawal) {
    return {
      valid: false,
      message: `Minimum withdrawal amount is ${commissionSettings.minWithdrawal.toLocaleString('vi-VN')}đ`
    }
  }
  
  return { valid: true }
}

/**
 * Check if user can create more links
 */
export async function canCreateMoreLinks(currentLinkCount: number): Promise<boolean> {
  const linksSettings = await getLinksSettings()
  return currentLinkCount < linksSettings.maxLinksPerUser
}
