const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@dongypharmacy.com',
        password: hashedPassword,
        fullName: 'Administrator',
        phoneNumber: '0123456789',
        address: 'Hà Nội, Việt Nam',
        role: 'ADMIN',
        status: 'ACTIVE',
        referralCode: 'ADMIN001'
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('Status:', admin.status);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
