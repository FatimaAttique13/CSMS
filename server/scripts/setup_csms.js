/**
 * setup_csms.js
 * One-time setup script for CSMS MongoDB database.
 * Creates collections with validators, indexes, and seeds initial data.
 * 
 * Usage:
 *   node setup_csms.js
 * 
 * Or via MongoDB Shell (mongosh):
 *   load("setup_csms.js")
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DB_NAME = process.env.MONGODB_DB_NAME || 'csms_db';
const DB_URI = process.env.MONGODB_URI;

console.log('='.repeat(60));
console.log('CSMS Database Setup Script');
console.log('='.repeat(60));
console.log(`Database: ${DB_NAME}`);
console.log(`URI: ${DB_URI}`);
console.log('='.repeat(60));

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop existing collections if they exist (careful in production!)
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\nExisting collections:', collectionNames.length > 0 ? collectionNames.join(', ') : 'None');

    // ========== USERS COLLECTION ==========
    console.log('\n[1/5] Creating users collection...');
    if (collectionNames.includes('users')) {
      await db.collection('users').drop();
      console.log('  ↳ Dropped existing users collection');
    }

    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'role', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            email: { 
              bsonType: 'string',
              pattern: '^\\S+@\\S+\\.\\S+$',
              description: 'Valid email address required'
            },
            password: { 
              bsonType: 'string',
              minLength: 6,
              description: 'Hashed password, min 6 chars'
            },
            role: { 
              enum: ['customer', 'admin'],
              description: 'User role: customer or admin'
            },
            profile: {
              bsonType: 'object',
              properties: {
                firstName: { bsonType: 'string' },
                lastName: { bsonType: 'string' },
                phone: { bsonType: 'string' },
                company: { bsonType: 'string' }
              }
            },
            addresses: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['line1', 'city'],
                properties: {
                  label: { bsonType: 'string' },
                  line1: { bsonType: 'string' },
                  line2: { bsonType: 'string' },
                  city: { bsonType: 'string' },
                  notes: { bsonType: 'string' },
                  isDefault: { bsonType: 'bool' }
                }
              }
            },
            isActive: { bsonType: 'bool' },
            lastLogin: { bsonType: 'date' },
            metadata: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });

    await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
    await db.collection('users').createIndex({ role: 1 }, { name: 'by_role' });
    console.log('  ✓ Users collection created with indexes');

    // ========== PRODUCTS COLLECTION ==========
    console.log('\n[2/5] Creating products collection...');
    if (collectionNames.includes('products')) {
      await db.collection('products').drop();
      console.log('  ↳ Dropped existing products collection');
    }

    await db.createCollection('products', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'sku', 'category', 'unit', 'unitPrice', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            name: { bsonType: 'string' },
            sku: { bsonType: 'string' },
            category: { enum: ['cement', 'aggregate', 'sand', 'other'] },
            description: { bsonType: 'string' },
            unit: { enum: ['bags', 'tons', 'kg', 'm3', 'units'] },
            unitPrice: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            taxRate: { bsonType: ['double', 'int', 'decimal'], minimum: 0, maximum: 1 },
            stockQuantity: { bsonType: ['int'], minimum: 0 },
            reorderLevel: { bsonType: ['int'], minimum: 0 },
            isActive: { bsonType: 'bool' },
            metadata: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });

    await db.collection('products').createIndex({ sku: 1 }, { unique: true, name: 'uniq_sku' });
    await db.collection('products').createIndex({ name: 1 }, { name: 'by_name' });
    await db.collection('products').createIndex({ category: 1 }, { name: 'by_category' });
    await db.collection('products').createIndex({ name: 'text', description: 'text' }, { name: 'text_search' });
    console.log('  ✓ Products collection created with indexes');

    // ========== ORDERS COLLECTION ==========
    console.log('\n[3/5] Creating orders collection...');
    if (collectionNames.includes('orders')) {
      await db.collection('orders').drop();
      console.log('  ↳ Dropped existing orders collection');
    }

    await db.createCollection('orders', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['orderNumber', 'customer', 'status', 'items', 'subtotal', 'tax', 'total', 'currency', 'createdAt', 'updatedAt'],
          properties: {
            orderNumber: { bsonType: 'string' },
            customer: { bsonType: 'objectId' },
            status: { enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'] },
            items: {
              bsonType: 'array',
              minItems: 1,
              items: {
                bsonType: 'object',
                required: ['product', 'name', 'unit', 'quantity', 'unitPrice', 'lineTotal'],
                properties: {
                  product: { bsonType: 'objectId' },
                  name: { bsonType: 'string' },
                  unit: { bsonType: 'string' },
                  quantity: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                  unitPrice: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                  lineTotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 }
                }
              }
            },
            subtotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            tax: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            total: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            currency: { bsonType: 'string' },
            deliveryAddress: {
              bsonType: 'object',
              properties: {
                line1: { bsonType: 'string' },
                line2: { bsonType: 'string' },
                city: { bsonType: 'string' },
                notes: { bsonType: 'string' }
              }
            },
            deliveryETA: { bsonType: 'date' },
            deliveredAt: { bsonType: 'date' },
            cancelledAt: { bsonType: 'date' },
            cancellationReason: { bsonType: 'string' },
            timeline: { bsonType: 'array' },
            invoice: { bsonType: 'objectId' },
            metadata: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });

    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true, name: 'uniq_orderNumber' });
    await db.collection('orders').createIndex({ customer: 1 }, { name: 'by_customer' });
    await db.collection('orders').createIndex({ status: 1 }, { name: 'by_status' });
    await db.collection('orders').createIndex({ createdAt: -1 }, { name: 'by_created_desc' });
    console.log('  ✓ Orders collection created with indexes');

    // ========== INVOICES COLLECTION ==========
    console.log('\n[4/5] Creating invoices collection...');
    if (collectionNames.includes('invoices')) {
      await db.collection('invoices').drop();
      console.log('  ↳ Dropped existing invoices collection');
    }

    await db.createCollection('invoices', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['invoiceNumber', 'order', 'customer', 'status', 'items', 'subtotal', 'tax', 'total', 'currency', 'dueDate', 'createdAt', 'updatedAt'],
          properties: {
            invoiceNumber: { bsonType: 'string' },
            order: { bsonType: 'objectId' },
            customer: { bsonType: 'objectId' },
            status: { enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'] },
            items: {
              bsonType: 'array',
              minItems: 1,
              items: {
                bsonType: 'object',
                required: ['name', 'unit', 'quantity', 'unitPrice', 'lineTotal'],
                properties: {
                  orderItemRef: { bsonType: 'objectId' },
                  name: { bsonType: 'string' },
                  unit: { bsonType: 'string' },
                  quantity: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                  unitPrice: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                  lineTotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 }
                }
              }
            },
            subtotal: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            tax: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            total: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            currency: { bsonType: 'string' },
            amountPaid: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
            dueDate: { bsonType: 'date' },
            paidAt: { bsonType: 'date' },
            cancelledAt: { bsonType: 'date' },
            cancellationReason: { bsonType: 'string' },
            notes: { bsonType: 'string' },
            timeline: { bsonType: 'array' },
            metadata: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });

    await db.collection('invoices').createIndex({ invoiceNumber: 1 }, { unique: true, name: 'uniq_invoiceNumber' });
    await db.collection('invoices').createIndex({ order: 1 }, { name: 'by_order' });
    await db.collection('invoices').createIndex({ customer: 1 }, { name: 'by_customer' });
    await db.collection('invoices').createIndex({ status: 1 }, { name: 'by_status' });
    await db.collection('invoices').createIndex({ dueDate: 1 }, { name: 'by_dueDate' });
    console.log('  ✓ Invoices collection created with indexes');

    // ========== INVENTORY TRANSACTIONS COLLECTION ==========
    console.log('\n[5/5] Creating inventorytransactions collection...');
    if (collectionNames.includes('inventorytransactions')) {
      await db.collection('inventorytransactions').drop();
      console.log('  ↳ Dropped existing inventorytransactions collection');
    }

    await db.createCollection('inventorytransactions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['product', 'type', 'quantity', 'beforeQuantity', 'afterQuantity', 'createdAt', 'updatedAt'],
          properties: {
            product: { bsonType: 'objectId' },
            type: { enum: ['INBOUND', 'OUTBOUND', 'ADJUSTMENT'] },
            quantity: { bsonType: ['double', 'int', 'decimal'] },
            beforeQuantity: { bsonType: ['double', 'int', 'decimal'] },
            afterQuantity: { bsonType: ['double', 'int', 'decimal'] },
            reason: { bsonType: 'string' },
            reference: { bsonType: 'string' },
            performedBy: { bsonType: 'objectId' },
            metadata: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });

    await db.collection('inventorytransactions').createIndex({ product: 1 }, { name: 'by_product' });
    await db.collection('inventorytransactions').createIndex({ createdAt: -1 }, { name: 'by_created_desc' });
    console.log('  ✓ Inventory transactions collection created with indexes');

    // ========== SEED DATA ==========
    console.log('\n' + '='.repeat(60));
    console.log('Seeding initial data...');
    console.log('='.repeat(60));

    const bcrypt = require('bcryptjs');

    // Seed Admin User
    const adminExists = await db.collection('users').findOne({ email: 'admin@csms.com' });
    let adminId;
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminResult = await db.collection('users').insertOne({
        email: 'admin@csms.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+966-500-000-000',
          company: 'CSMS HQ'
        },
        addresses: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      adminId = adminResult.insertedId;
      console.log('  ✓ Created admin user (admin@csms.com / admin123)');
    } else {
      adminId = adminExists._id;
      console.log('  ↳ Admin user already exists');
    }

    // Seed Customer User
    const customerExists = await db.collection('users').findOne({ email: 'customer@example.com' });
    let customerId;
    if (!customerExists) {
      const hashedPassword = await bcrypt.hash('customer123', 10);
      const customerResult = await db.collection('users').insertOne({
        email: 'customer@example.com',
        password: hashedPassword,
        role: 'customer',
        profile: {
          firstName: 'Ahmed',
          lastName: 'Al-Saud',
          phone: '+966-555-123-456',
          company: 'Al-Saud Construction'
        },
        addresses: [{
          label: 'Office',
          line1: 'King Fahd Road',
          line2: 'Office 301',
          city: 'Riyadh',
          notes: 'Main office location',
          isDefault: true
        }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      customerId = customerResult.insertedId;
      console.log('  ✓ Created customer user (customer@example.com / customer123)');
    } else {
      customerId = customerExists._id;
      console.log('  ↳ Customer user already exists');
    }

    // Seed Products
    const productsData = [
      {
        name: 'Portland Cement Type I',
        sku: 'CEM-PT-001',
        category: 'cement',
        description: 'High-quality Portland cement suitable for general construction',
        unit: 'bags',
        unitPrice: 25.50,
        taxRate: 0.15,
        stockQuantity: 5000,
        reorderLevel: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coarse Aggregate 20mm',
        sku: 'AGG-CR-20',
        category: 'aggregate',
        description: '20mm crushed stone aggregate for concrete',
        unit: 'tons',
        unitPrice: 45.00,
        taxRate: 0.15,
        stockQuantity: 2000,
        reorderLevel: 500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fine Sand',
        sku: 'SND-FN-001',
        category: 'sand',
        description: 'Washed fine sand for masonry and plastering',
        unit: 'm3',
        unitPrice: 35.00,
        taxRate: 0.15,
        stockQuantity: 1500,
        reorderLevel: 300,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ready Mix Concrete M30',
        sku: 'OTH-RMC-M30',
        category: 'other',
        description: 'Ready-mix concrete grade M30',
        unit: 'm3',
        unitPrice: 180.00,
        taxRate: 0.15,
        stockQuantity: 500,
        reorderLevel: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    let productIds = [];
    for (const product of productsData) {
      const exists = await db.collection('products').findOne({ sku: product.sku });
      if (!exists) {
        const result = await db.collection('products').insertOne(product);
        productIds.push(result.insertedId);
        console.log(`  ✓ Created product: ${product.name}`);
      } else {
        productIds.push(exists._id);
        console.log(`  ↳ Product already exists: ${product.name}`);
      }
    }

    // Seed Sample Order
    const orderExists = await db.collection('orders').findOne({ orderNumber: 'ORD-2025-001' });
    let orderId;
    if (!orderExists && customerId && productIds.length > 0) {
      const orderData = {
        orderNumber: 'ORD-2025-001',
        customer: customerId,
        status: 'Confirmed',
        items: [
          {
            product: productIds[0],
            name: 'Portland Cement Type I',
            unit: 'bags',
            quantity: 100,
            unitPrice: 25.50,
            lineTotal: 2550.00
          },
          {
            product: productIds[2],
            name: 'Fine Sand',
            unit: 'm3',
            quantity: 50,
            unitPrice: 35.00,
            lineTotal: 1750.00
          }
        ],
        subtotal: 4300.00,
        tax: 645.00,
        total: 4945.00,
        currency: 'SAR',
        deliveryAddress: {
          line1: 'King Fahd Road',
          line2: 'Construction Site B',
          city: 'Riyadh',
          notes: 'Deliver to site entrance'
        },
        deliveryETA: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeline: [
          { status: 'Pending', at: new Date(), note: 'Order placed' },
          { status: 'Confirmed', at: new Date(), note: 'Order confirmed by admin' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const orderResult = await db.collection('orders').insertOne(orderData);
      orderId = orderResult.insertedId;
      console.log('  ✓ Created sample order (ORD-2025-001)');
    } else {
      console.log('  ↳ Sample order already exists or dependencies missing');
    }

    // Seed Sample Invoice
    if (orderId && customerId) {
      const invoiceExists = await db.collection('invoices').findOne({ invoiceNumber: 'INV-2025-001' });
      if (!invoiceExists) {
        const invoiceData = {
          invoiceNumber: 'INV-2025-001',
          order: orderId,
          customer: customerId,
          status: 'Sent',
          items: [
            {
              name: 'Portland Cement Type I',
              unit: 'bags',
              quantity: 100,
              unitPrice: 25.50,
              lineTotal: 2550.00
            },
            {
              name: 'Fine Sand',
              unit: 'm3',
              quantity: 50,
              unitPrice: 35.00,
              lineTotal: 1750.00
            }
          ],
          subtotal: 4300.00,
          tax: 645.00,
          total: 4945.00,
          currency: 'SAR',
          amountPaid: 0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          notes: 'Payment due within 30 days',
          timeline: [
            { status: 'Draft', at: new Date(), note: 'Invoice created' },
            { status: 'Sent', at: new Date(), note: 'Invoice sent to customer' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await db.collection('invoices').insertOne(invoiceData);
        console.log('  ✓ Created sample invoice (INV-2025-001)');
      } else {
        console.log('  ↳ Sample invoice already exists');
      }
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('Setup Complete! Database Summary:');
    console.log('='.repeat(60));

    const counts = {
      users: await db.collection('users').countDocuments(),
      products: await db.collection('products').countDocuments(),
      orders: await db.collection('orders').countDocuments(),
      invoices: await db.collection('invoices').countDocuments(),
      inventoryTransactions: await db.collection('inventorytransactions').countDocuments()
    };

    console.log(JSON.stringify(counts, null, 2));
    console.log('\n' + '='.repeat(60));
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@csms.com / admin123');
    console.log('  Customer: customer@example.com / customer123');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('\n✅ Setup completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
