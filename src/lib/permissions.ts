import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface UserPermissions {
  userId: string;
  permissions: string[];
  role: string;
}

/**
 * Láº¥y quyá»n ngÆ°á»i dĂ¹ng tá»« cÆ¡ sá»Ÿ dá»¯ liá»‡u
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return null;
    }

    // Admin cĂ³ táº¥t cáº£ quyá»n
    if (user.role === 'ADMIN') {
      return {
        userId: user.id,
        role: user.role,
        permissions: ['*'] // KĂ½ tá»± Ä‘áº¡i diá»‡n cho táº¥t cáº£ quyá»n
      };
    }

    // Láº¥y quyá»n tá»« SystemSetting
    const permissionsKey = user_permissions_+userId;
    const permissionsSetting = await prisma.systemSetting.findUnique({
      where: { key: permissionsKey }
    });

    return {
      userId: user.id,
      role: user.role,
      permissions: (permissionsSetting?.value as string[]) || []
    };

  } catch (error) {
    console.error('Lá»—i khi láº¥y quyá»n ngÆ°á»i dĂ¹ng:', error);
    return null;
  }
}

/**
 * Kiá»ƒm tra ngÆ°á»i dĂ¹ng cĂ³ quyá»n cá»¥ thá»ƒ khĂ´ng
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    // Admin cĂ³ táº¥t cáº£ quyá»n
    if (userPermissions.permissions.includes('*')) {
      return true;
    }

    // Kiá»ƒm tra quyá»n cá»¥ thá»ƒ
    return userPermissions.permissions.includes(permission);

  } catch (error) {
    console.error('Lá»—i khi kiá»ƒm tra quyá»n:', error);
    return false;
  }
}

/**
 * Kiá»ƒm tra ngÆ°á»i dĂ¹ng cĂ³ báº¥t ká»³ quyá»n nĂ o trong danh sĂ¡ch khĂ´ng
 */
export async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    
    if (!userPermissions) {
      return false;
    }

    // Admin cĂ³ táº¥t cáº£ quyá»n
    if (userPermissions.permissions.includes('*')) {
      return true;
    }

    // Kiá»ƒm tra ngÆ°á»i dĂ¹ng cĂ³ báº¥t ká»³ quyá»n nĂ o Ä‘Æ°á»£c chá»‰ Ä‘á»‹nh khĂ´ng
    return permissions.some(permission => userPermissions.permissions.includes(permission));

  } catch (error) {
    console.error('Lá»—i khi kiá»ƒm tra quyá»n:', error);
    return false;
  }
}

/**
 * Middleware yĂªu cáº§u quyá»n cá»¥ thá»ƒ
 */
export async function requirePermission(permission: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Vui lĂ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n thao tĂ¡c nĂ y');
  }

  const hasAccess = await hasPermission(session.user.id, permission);
  
  if (!hasAccess) {
    throw new Error('Báº¡n khĂ´ng cĂ³ quyá»n thá»±c hiá»‡n thao tĂ¡c nĂ y');
  }

  return session;
}

/**
 * Middleware yĂªu cáº§u quyá»n admin
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Vui lĂ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n thao tĂ¡c nĂ y');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Báº¡n khĂ´ng cĂ³ quyá»n thá»±c hiá»‡n thao tĂ¡c nĂ y');
  }

  return session;
}

/**
 * Láº¥y ngÆ°á»i dĂ¹ng hiá»‡n táº¡i vá»›i quyá»n
 */
export async function getCurrentUserWithPermissions() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const userPermissions = await getUserPermissions(session.user.id);
  
  return {
    ...session.user,
    permissions: userPermissions?.permissions || [],
    role: userPermissions?.role || 'CUSTOMER'
  };
}

// Danh sĂ¡ch quyá»n cĂ³ sáºµn
export const AVAILABLE_PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.edit',
  'users.create',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'orders.view',
  'orders.edit',
  'orders.delete',
  'categories.view',
  'categories.create',
  'categories.edit',
  'categories.delete',
  'posts.view',
  'posts.create',
  'posts.edit',
  'posts.delete',
  'affiliate.view',
  'affiliate.manage',
  'withdrawals.view',
  'withdrawals.approve',
  'settings.view',
  'settings.edit',
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number];