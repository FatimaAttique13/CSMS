const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DB_URI = 'mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db?retryWrites=true&w=majority';

async function setupAdmin() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check if admin exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@csms.com' });
    
    if (existingAdmin) {
      console.log('\n📧 Admin user exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Active:', existingAdmin.isActive);
      
      // Update to ensure it's an admin
      if (existingAdmin.role !== 'admin') {
        await db.collection('users').updateOne(
          { email: 'admin@csms.com' },
          { $set: { role: 'admin' } }
        );
        console.log('\n✓ Updated role to admin');
      }
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.collection('users').insertOne({
        email: 'admin@csms.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+966123456789',
          company: 'CSMS'
        },
        addresses: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('\n✓ Created admin user: admin@csms.com / admin123');
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
