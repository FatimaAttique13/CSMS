const mongoose = require('mongoose');

const DB_URI = 'mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db';

async function seedProducts() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Clear existing products
    await db.collection('products').deleteMany({});
    console.log('Cleared existing products');

    const products = [
      {
        name: 'Premium Portland Cement',
        sku: 'CEM-PT-001',
        category: 'cement',
        description: 'High-quality Portland cement for all construction needs. Meets international standards.',
        unit: 'bags',
        unitPrice: 75,
        taxRate: 0.15,
        stockQuantity: 5000,
        reorderLevel: 1000,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
        features: ['High strength grade', 'Quick setting', 'Weather resistant', 'Quality certified'],
        specifications: { 'Compressive Strength': '42.5 MPa', 'Setting Time': '30-600 minutes' }
      },
      {
        name: 'White Portland Cement',
        sku: 'CEM-WHT-001',
        category: 'cement',
        description: 'Premium white cement for decorative and architectural applications.',
        unit: 'bags',
        unitPrice: 95,
        taxRate: 0.15,
        stockQuantity: 3000,
        reorderLevel: 500,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
        features: ['Pure white color', 'Architectural grade', 'Smooth finish', 'UV resistant'],
        specifications: { 'Whiteness': '>85%', 'Compressive Strength': '42.5 MPa' }
      },
      {
        name: 'Quick Setting Cement',
        sku: 'CEM-QS-001',
        category: 'cement',
        description: 'Rapid hardening cement ideal for urgent repairs and quick construction.',
        unit: 'bags',
        unitPrice: 85,
        taxRate: 0.15,
        stockQuantity: 2000,
        reorderLevel: 400,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
        features: ['Ultra-fast setting', 'High early strength', 'Cold weather ready', 'Premium quality'],
        specifications: { 'Setting Time': '15-45 minutes', 'Compressive Strength': '52.5 MPa' }
      },
      {
        name: 'Bulk Portland Cement',
        sku: 'CEM-BLK-001',
        category: 'cement',
        description: 'Bulk cement delivery for large construction projects.',
        unit: 'tons',
        unitPrice: 650,
        taxRate: 0.15,
        stockQuantity: 500,
        reorderLevel: 100,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        features: ['Bulk delivery', 'Cost effective', 'Large projects', 'Pneumatic delivery'],
        specifications: { 'Minimum Order': '10 tons', 'Delivery Method': 'Pneumatic truck' }
      },
      {
        name: 'Crushed Granite 20mm',
        sku: 'AGG-GR-20',
        category: 'aggregate',
        description: 'Premium crushed granite aggregate for concrete production and road construction.',
        unit: 'tons',
        unitPrice: 45,
        taxRate: 0.15,
        stockQuantity: 8000,
        reorderLevel: 2000,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1544819667-3131c8c8da2b?w=400',
        features: ['Angular shape', 'High strength', 'Washed clean', 'Consistent grading'],
        specifications: { 'Size': '20mm nominal', 'Shape': 'Angular/Crushed', 'Absorption': '<2%' }
      },
      {
        name: 'Crushed Granite 14mm',
        sku: 'AGG-GR-14',
        category: 'aggregate',
        description: 'Medium grade crushed granite perfect for standard concrete mixing.',
        unit: 'tons',
        unitPrice: 48,
        taxRate: 0.15,
        stockQuantity: 6000,
        reorderLevel: 1500,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
        features: ['Medium grade', 'Concrete ready', 'Clean washed', 'Quality tested'],
        specifications: { 'Size': '14mm nominal', 'Shape': 'Angular/Crushed' }
      },
      {
        name: 'Fine Aggregate 10mm',
        sku: 'AGG-FN-10',
        category: 'aggregate',
        description: 'Fine aggregate suitable for plastering and fine concrete work.',
        unit: 'tons',
        unitPrice: 52,
        taxRate: 0.15,
        stockQuantity: 5000,
        reorderLevel: 1000,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        features: ['Fine grade', 'Smooth finish', 'Multi-purpose', 'Clean material'],
        specifications: { 'Size': '10mm nominal', 'Absorption': '<2.5%' }
      },
      {
        name: 'Coarse Sand',
        sku: 'SND-CR-001',
        category: 'sand',
        description: 'Premium coarse sand perfect for concrete mixing and masonry work.',
        unit: 'tons',
        unitPrice: 35,
        taxRate: 0.15,
        stockQuantity: 10000,
        reorderLevel: 2500,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400',
        features: ['Coarse texture', 'Concrete grade', 'Well graded', 'Low silt content'],
        specifications: { 'Fineness Modulus': '2.6-3.2', 'Silt Content': '<3%', 'Moisture': '<5%' }
      },
      {
        name: 'Fine Plastering Sand',
        sku: 'SND-PL-001',
        category: 'sand',
        description: 'Fine sand specially processed for plastering and finishing work.',
        unit: 'tons',
        unitPrice: 40,
        taxRate: 0.15,
        stockQuantity: 7000,
        reorderLevel: 1500,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
        features: ['Fine texture', 'Smooth finish', 'Low clay content', 'Sieved clean'],
        specifications: { 'Fineness Modulus': '1.8-2.4', 'Silt Content': '<2%', 'Clay Content': '<2%' }
      },
      {
        name: 'Washed Sand',
        sku: 'SND-WS-001',
        category: 'sand',
        description: 'Clean washed sand for high-quality concrete and construction work.',
        unit: 'tons',
        unitPrice: 38,
        taxRate: 0.15,
        stockQuantity: 8000,
        reorderLevel: 2000,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        features: ['Triple washed', 'Zero impurities', 'Consistent quality', 'Ready to use'],
        specifications: { 'Washing Process': 'Triple wash', 'Impurities': '<1%' }
      }
    ];

    products.forEach(p => {
      p.createdAt = new Date();
      p.updatedAt = new Date();
    });

    await db.collection('products').insertMany(products);
    console.log(`✓ Successfully seeded ${products.length} products with images!`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
