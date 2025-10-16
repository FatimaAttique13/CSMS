const mongoose = require('mongoose');

const DB_URI = 'mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db?retryWrites=true&w=majority';

async function checkDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCount = await db.collection('products').countDocuments();
    
    console.log(`\n📦 Products in database: ${productsCount}`);
    
    if (productsCount > 0) {
      console.log('\n✓ Database has products! Fetching first 3...\n');
      const samples = await db.collection('products').find().limit(3).toArray();
      samples.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.category} - $${p.unitPrice} - Stock: ${p.stockQuantity}`);
      });
    } else {
      console.log('\n⚠️  Database is empty! Run seed_products_quick.js to add products.');
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB();
