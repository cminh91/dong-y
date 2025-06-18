import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// For this implementation, we'll store settings in a simple JSON format
// In a production app, you might want a dedicated settings table

const DEFAULT_SETTINGS = {
  commissions: {
    defaultRate: 0.15,
    level1Rate: 0.15,
    level2Rate: 0.05,
    minWithdrawal: 500000,
    withdrawalFee: 50000,
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

// Helper function to get setting by key
async function getSetting(key: string, category: string, defaultValue: any) {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key }
    })
    return setting ? setting.value : defaultValue
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return defaultValue
  }
}

// Helper function to set setting
async function setSetting(key: string, category: string, value: any, description?: string) {
  try {
    return await prisma.systemSetting.upsert({
      where: { key },
      update: { value, category, description },
      create: { key, value, category, description }
    })
  } catch (error) {
    console.error(`Error setting ${key}:`, error)
    throw error
  }
}

// GET /api/admin/affiliate/settings - Lấy cấu hình hệ thống
export async function GET(request: NextRequest) {
  try {
    // Fetch settings from database or use defaults
    const settings = {
      commissions: await getSetting('affiliate_commissions', 'commissions', DEFAULT_SETTINGS.commissions),
      registration: await getSetting('affiliate_registration', 'registration', DEFAULT_SETTINGS.registration),
      links: await getSetting('affiliate_links', 'links', DEFAULT_SETTINGS.links),
      notifications: await getSetting('affiliate_notifications', 'notifications', DEFAULT_SETTINGS.notifications),
      security: await getSetting('affiliate_security', 'security', DEFAULT_SETTINGS.security)
    }

    return NextResponse.json({
      success: true,
      data: settings
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/affiliate/settings - Cập nhật cấu hình hệ thống
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, settings } = body

    if (!section || !settings) {
      return NextResponse.json(
        { success: false, error: 'Missing section or settings data' },
        { status: 400 }
      )
    }

    // Validate section
    const validSections = ['commissions', 'registration', 'links', 'notifications', 'security']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid settings section' },
        { status: 400 }
      )
    }

    // Validate and process settings based on section
    let validatedSettings: any = {}

    switch (section) {
      case 'commissions':
        validatedSettings = await validateCommissionSettings(settings)
        break
      case 'registration':
        validatedSettings = await validateRegistrationSettings(settings)
        break
      case 'links':
        validatedSettings = await validateLinksSettings(settings)
        break
      case 'notifications':
        validatedSettings = await validateNotificationSettings(settings)
        break
      case 'security':
        validatedSettings = await validateSecuritySettings(settings)
        break
    }

    // Save validated settings to database
    const settingKey = `affiliate_${section}`
    const description = `Affiliate ${section} settings`

    await setSetting(settingKey, section, validatedSettings, description)

    return NextResponse.json({
      success: true,
      data: {
        section,
        settings: validatedSettings,
        message: `${section} settings updated successfully`
      }
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function validateCommissionSettings(settings: any) {
  const {
    defaultRate,
    level1Rate,
    level2Rate,
    minWithdrawal,
    withdrawalFee,
    paymentSchedule
  } = settings

  // Validate commission rates (0-100%)
  if (defaultRate !== undefined && (defaultRate < 0 || defaultRate > 1)) {
    throw new Error('Default commission rate must be between 0 and 1')
  }
  if (level1Rate !== undefined && (level1Rate < 0 || level1Rate > 1)) {
    throw new Error('Level 1 commission rate must be between 0 and 1')
  }
  if (level2Rate !== undefined && (level2Rate < 0 || level2Rate > 1)) {
    throw new Error('Level 2 commission rate must be between 0 and 1')
  }

  // Validate withdrawal amounts
  if (minWithdrawal !== undefined && minWithdrawal < 0) {
    throw new Error('Minimum withdrawal amount must be positive')
  }
  if (withdrawalFee !== undefined && withdrawalFee < 0) {
    throw new Error('Withdrawal fee must be positive')
  }

  // Validate payment schedule
  const validSchedules = ['daily', 'weekly', 'monthly', 'manual']
  if (paymentSchedule !== undefined && !validSchedules.includes(paymentSchedule)) {
    throw new Error('Invalid payment schedule')
  }

  return {
    defaultRate: defaultRate ?? DEFAULT_SETTINGS.commissions.defaultRate,
    level1Rate: level1Rate ?? DEFAULT_SETTINGS.commissions.level1Rate,
    level2Rate: level2Rate ?? DEFAULT_SETTINGS.commissions.level2Rate,
    minWithdrawal: minWithdrawal ?? DEFAULT_SETTINGS.commissions.minWithdrawal,
    withdrawalFee: withdrawalFee ?? DEFAULT_SETTINGS.commissions.withdrawalFee,
    paymentSchedule: paymentSchedule ?? DEFAULT_SETTINGS.commissions.paymentSchedule
  }
}

async function validateRegistrationSettings(settings: any) {
  const {
    autoApproval,
    requireVerification,
    welcomeBonus,
    referralBonus
  } = settings

  // Validate bonus amounts
  if (welcomeBonus !== undefined && welcomeBonus < 0) {
    throw new Error('Welcome bonus must be positive')
  }
  if (referralBonus !== undefined && referralBonus < 0) {
    throw new Error('Referral bonus must be positive')
  }

  return {
    autoApproval: autoApproval ?? DEFAULT_SETTINGS.registration.autoApproval,
    requireVerification: requireVerification ?? DEFAULT_SETTINGS.registration.requireVerification,
    welcomeBonus: welcomeBonus ?? DEFAULT_SETTINGS.registration.welcomeBonus,
    referralBonus: referralBonus ?? DEFAULT_SETTINGS.registration.referralBonus
  }
}

async function validateLinksSettings(settings: any) {
  const {
    linkExpiry,
    maxLinksPerUser,
    trackingCookieDuration,
    allowCustomSlugs
  } = settings

  // Validate numeric values
  if (linkExpiry !== undefined && linkExpiry < 1) {
    throw new Error('Link expiry must be at least 1 day')
  }
  if (maxLinksPerUser !== undefined && maxLinksPerUser < 1) {
    throw new Error('Max links per user must be at least 1')
  }
  if (trackingCookieDuration !== undefined && trackingCookieDuration < 1) {
    throw new Error('Tracking cookie duration must be at least 1 day')
  }

  return {
    linkExpiry: linkExpiry ?? DEFAULT_SETTINGS.links.linkExpiry,
    maxLinksPerUser: maxLinksPerUser ?? DEFAULT_SETTINGS.links.maxLinksPerUser,
    trackingCookieDuration: trackingCookieDuration ?? DEFAULT_SETTINGS.links.trackingCookieDuration,
    allowCustomSlugs: allowCustomSlugs ?? DEFAULT_SETTINGS.links.allowCustomSlugs
  }
}

async function validateNotificationSettings(settings: any) {
  const {
    emailNotifications,
    newRegistrationAlert,
    withdrawalRequestAlert,
    commissionAlert
  } = settings

  return {
    emailNotifications: emailNotifications ?? DEFAULT_SETTINGS.notifications.emailNotifications,
    newRegistrationAlert: newRegistrationAlert ?? DEFAULT_SETTINGS.notifications.newRegistrationAlert,
    withdrawalRequestAlert: withdrawalRequestAlert ?? DEFAULT_SETTINGS.notifications.withdrawalRequestAlert,
    commissionAlert: commissionAlert ?? DEFAULT_SETTINGS.notifications.commissionAlert
  }
}

async function validateSecuritySettings(settings: any) {
  const {
    requireTwoFactor,
    sessionTimeout,
    ipWhitelist,
    fraudDetection
  } = settings

  // Validate session timeout
  if (sessionTimeout !== undefined && sessionTimeout < 5) {
    throw new Error('Session timeout must be at least 5 minutes')
  }

  return {
    requireTwoFactor: requireTwoFactor ?? DEFAULT_SETTINGS.security.requireTwoFactor,
    sessionTimeout: sessionTimeout ?? DEFAULT_SETTINGS.security.sessionTimeout,
    ipWhitelist: ipWhitelist ?? DEFAULT_SETTINGS.security.ipWhitelist,
    fraudDetection: fraudDetection ?? DEFAULT_SETTINGS.security.fraudDetection
  }
}
