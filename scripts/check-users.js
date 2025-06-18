const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('=== ALL USERS ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Check for admin users
    const adminUsers = users.filter(user => user.role === 'ADMIN');
    console.log('=== ADMIN USERS ===');
    if (adminUsers.length === 0) {
      console.log('No admin users found!');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.fullName} (${admin.email})`);
        console.log(`   Status: ${admin.status}`);
      });
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
