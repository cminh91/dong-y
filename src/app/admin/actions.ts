'use server'

import { logoutAction } from '@/lib/auth-actions';

export async function handleLogout() {
  await logoutAction();
}