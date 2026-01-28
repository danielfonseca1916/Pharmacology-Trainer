import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'admin@pharmtrainer.test' } 
  });
  
  if (user) {
    console.log('Admin user exists:', user.email, 'Role:', user.role);
    const match = await bcrypt.compare('admin123', user.passwordHash);
    console.log('Password admin123 works:', match);
    
    if (!match) {
      console.log('Resetting password to admin123...');
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@pharmtrainer.test' },
        data: { passwordHash: newHash, role: 'ADMIN' }
      });
      console.log('✅ Password reset complete!');
    }
  } else {
    console.log('Creating admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@pharmtrainer.test',
        passwordHash: hash,
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created!');
  }
  
  await prisma.$disconnect();
}

checkAdmin();
