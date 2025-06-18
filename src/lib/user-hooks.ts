'use server'

import { prisma } from '@/lib/prisma'

/**
 * Generates a unique referral code for a user
 */
async function generateReferralCode(userId: string, fullName: string): Promise<string> {
  // Create a base referral code from user's name and ID
  // Handle cases where fullName might be null or undefined
  const safeName = fullName || 'USER'
  const namePrefix = safeName
    .split(' ')
    .map(word => word && word.charAt(0) ? word.charAt(0).toUpperCase() : 'U')
    .join('')
    .substring(0, 3)
  
  const userIdSuffix = userId.substring(0, 6).toUpperCase()
  let baseCode = `${namePrefix}${userIdSuffix}`
  
  // Ensure the code is unique
  let counter = 0
  let referralCode = baseCode
  
  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { referralCode }
    })
    
    if (!existingUser) {
      break
    }
    
    counter++
    referralCode = `${baseCode}${counter}`
  }
  
  return referralCode
}

/**
 * Handles post-registration logic for users
 */
export async function afterUserRegistration(userId: string, referralCode?: string) {
  try {
    // Get the newly created user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Generate and assign referral code for the new user
    const newReferralCode = await generateReferralCode(userId, user.fullName)
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        referralCode: newReferralCode
      }
    })
    
    // Handle referral logic if a referral code was used during registration
    if (referralCode && user.referredBy) {
      await handleReferralReward(user.referredBy, userId)
    }
    
    console.log(`User ${user.fullName} registered successfully with referral code: ${newReferralCode}`)
    
  } catch (error) {
    console.error('Error in afterUserRegistration:', error)
    // Don't throw error to prevent registration failure due to referral code generation
  }
}

/**
 * Handles referral rewards when someone uses a referral code
 */
async function handleReferralReward(referrerId: string, newUserId: string) {
  try {
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId }
    })
    
    if (!referrer) {
      console.log('Referrer not found')
      return
    }
    
    // Check if referrer is eligible for referral rewards (COLLABORATOR or AGENT)
    if (referrer.role === 'COLLABORATOR' || referrer.role === 'AGENT') {
      // Update referrer's available balance with referral bonus
      const bonusAmount = getReferralRewardAmount(referrer.role)
      
      await prisma.user.update({
        where: { id: referrerId },
        data: {
          availableBalance: { increment: bonusAmount },
          totalCommission: { increment: bonusAmount }
        }
      })
      
      console.log(`Referral bonus of ${bonusAmount} VND added to ${referrer.fullName}'s account`)
    }
    
  } catch (error) {
    console.error('Error handling referral reward:', error)
  }
}

/**
 * Gets the referral reward amount based on referrer's role
 */
function getReferralRewardAmount(role: string): number {
  switch (role) {
    case 'AGENT':
      return 50000 // 50k VND for agents
    case 'COLLABORATOR':
      return 25000 // 25k VND for collaborators
    default:
      return 0
  }
}

/**
 * Updates user statistics after successful orders
 */
export async function afterOrderCompletion(userId: string, orderAmount: number, orderId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referredByUser: true
      }
    })
    
    if (!user) return
    
    // Update user's total sales (this field exists in schema)
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSales: { increment: orderAmount }
      }
    })
    
    // If user was referred by someone, create commission for referrer
    if (user.referredByUser && (user.referredByUser.role === 'COLLABORATOR' || user.referredByUser.role === 'AGENT')) {
      const commissionRate = getCommissionRate(user.referredByUser.role)
      const commissionAmount = Math.floor(orderAmount * commissionRate)
      
      if (commissionAmount > 0) {
        await prisma.commission.create({
          data: {
            userId: user.referredByUser.id,
            orderId: orderId,
            referredUserId: userId,
            level: 1, // Direct referral
            orderAmount: orderAmount,
            commissionRate: commissionRate,
            amount: commissionAmount,
            status: 'PENDING'
          }
        })
        
        // Update referrer's total commission
        await prisma.user.update({
          where: { id: user.referredByUser.id },
          data: {
            totalCommission: { increment: commissionAmount }
          }
        })
      }
    }
    
  } catch (error) {
    console.error('Error in afterOrderCompletion:', error)
  }
}

/**
 * Gets commission rate based on user role
 */
function getCommissionRate(role: string): number {
  switch (role) {
    case 'AGENT':
      return 0.05 // 5% commission for agents
    case 'COLLABORATOR':
      return 0.03 // 3% commission for collaborators
    default:
      return 0
  }
}

/**
 * Validates referral code and returns referrer info
 */
export async function validateReferralCode(referralCode: string) {
  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        fullName: true,
        role: true,
        status: true
      }
    })
    
    if (!referrer) {
      return { valid: false, message: 'Mã giới thiệu không tồn tại' }
    }
    
    if (referrer.status !== 'ACTIVE') {
      return { valid: false, message: 'Tài khoản người giới thiệu chưa được kích hoạt' }
    }
    
    if (referrer.role !== 'COLLABORATOR' && referrer.role !== 'AGENT') {
      return { valid: false, message: 'Mã giới thiệu không hợp lệ' }
    }
    
    return {
      valid: true,
      referrer: {
        id: referrer.id,
        fullName: referrer.fullName,
        role: referrer.role
      }
    }
    
  } catch (error) {
    console.error('Error validating referral code:', error)
    return { valid: false, message: 'Có lỗi xảy ra khi kiểm tra mã giới thiệu' }
  }
}
