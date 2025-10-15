/**
 * seed_test_data.js
 * Comprehensive test data seeding script for CSMS database.
 * Populates database with realistic test data for development and testing.
 * 
 * Usage:
 *   node seed_test_data.js
 * 
 * Note: Run setup_csms.js first to create collections and indexes.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DB_NAME = process.env.MONGODB_DB_NAME || 'csms_db';
const DB_URI = process.env.MONGODB_URI || `mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/${DB_NAME}`;

console.log('='.repeat(60));
console.log('CSMS Test Data Seeding Script');
console.log('='.repeat(60));
console.log(`Database: ${DB_NAME}`);
console.log(`URI: ${DB_URI}`);
console.log('='.repeat(60));

// Helper function to generate random dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate order number
function generateOrderNumber(index) {
  return `ORD-2025-${String(index).padStart(4, '0')}`;
}

// Helper function to generate invoice number
function generateInvoiceNumber(index) {
  return `INV-2025-${String(index).padStart(4, '0')}`;
}

async function seedTestData() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const bcrypt = require('bcryptjs');

    // ========== CLEAR EXISTING TEST DATA (OPTIONAL) ==========
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({ email: { $regex: /^test/ } });
    await db.collection('products').deleteMany({ sku: { $regex: /^TEST-/ } });
    await db.collection('orders').deleteMany({ orderNumber: { $regex: /^ORD-2025-(0[1-9]|[1-4][0-9]|50)/ } }); // ORD-2025-001 to ORD-2025-050
    await db.collection('invoices').deleteMany({ invoiceNumber: { $regex: /^INV-2025-(0[1-9]|[1-4][0-9]|50)/ } });
    await db.collection('inventorytransactions').deleteMany({});
    console.log('✓ Cleared existing test data\n');

    // ========== SEED USERS ==========
    console.log('[1/5] Seeding Users...');
    
    const usersData = [];
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Admin users
    usersData.push({
      email: 'test.admin@csms.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'Test',
        lastName: 'Admin',
        phone: '+966-500-111-111',
        company: 'CSMS Testing'
      },
      addresses: [],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Customer users
    const customerNames = [
      { first: 'Mohammed', last: 'Al-Rashid', company: 'Al-Rashid Construction', city: 'Riyadh' },
      { first: 'Fatima', last: 'Al-Zahrani', company: 'Modern Builders', city: 'Jeddah' },
      { first: 'Abdullah', last: 'Al-Otaibi', company: 'Desert Construction Co.', city: 'Dammam' },
      { first: 'Sara', last: 'Al-Mutairi', company: 'Green Build Solutions', city: 'Riyadh' },
      { first: 'Khalid', last: 'Al-Harbi', company: 'Skyline Developers', city: 'Mecca' },
      { first: 'Noura', last: 'Al-Dosari', company: 'Unity Construction', city: 'Medina' },
      { first: 'Omar', last: 'Al-Ghamdi', company: 'Prime Builders', city: 'Riyadh' },
      { first: 'Aisha', last: 'Al-Shehri', company: 'Elite Construction', city: 'Jeddah' }
    ];

    customerNames.forEach((customer, index) => {
      usersData.push({
        email: `test.customer${index + 1}@example.com`,
        password: hashedPassword,
        role: 'customer',
        profile: {
          firstName: customer.first,
          lastName: customer.last,
          phone: `+966-555-${String(100000 + index).substring(1)}`,
          company: customer.company
        },
        addresses: [{
          label: 'Main Office',
          line1: `Building ${index + 1}, ${customer.city} Business District`,
          line2: `Floor ${(index % 5) + 1}`,
          city: customer.city,
          notes: 'Primary delivery location',
          isDefault: true
        }],
        isActive: true,
        lastLogin: randomDate(new Date(2025, 9, 1), new Date()),
        createdAt: randomDate(new Date(2025, 0, 1), new Date(2025, 8, 1)),
        updatedAt: new Date()
      });
    });

    const userResults = await db.collection('users').insertMany(usersData);
    const userIds = Object.values(userResults.insertedIds);
    const customerIds = userIds.slice(1); // Exclude first admin user
    console.log(`  ✓ Created ${usersData.length} users (1 admin, ${customerNames.length} customers)`);

    // ========== SEED PRODUCTS ==========
    console.log('\n[2/5] Seeding Products...');

    const productsData = [
      // Cement Products
      { name: 'Portland Cement Type II', sku: 'TEST-CEM-PT-002', category: 'cement', description: 'Moderate sulfate resistant cement', unit: 'bags', unitPrice: 27.50, taxRate: 0.15, stockQuantity: 3000, reorderLevel: 800, isActive: true },
      { name: 'White Cement', sku: 'TEST-CEM-WHT-001', category: 'cement', description: 'Premium white cement for finishing', unit: 'bags', unitPrice: 45.00, taxRate: 0.15, stockQuantity: 1500, reorderLevel: 300, isActive: true },
      { name: 'Quick Setting Cement', sku: 'TEST-CEM-QS-001', category: 'cement', description: 'Rapid hardening cement', unit: 'bags', unitPrice: 32.00, taxRate: 0.15, stockQuantity: 2000, reorderLevel: 500, isActive: true },
      { name: 'Sulfate Resistant Cement', sku: 'TEST-CEM-SR-001', category: 'cement', description: 'For harsh soil conditions', unit: 'bags', unitPrice: 35.00, taxRate: 0.15, stockQuantity: 1800, reorderLevel: 400, isActive: true },
      
      // Aggregate Products
      { name: 'Coarse Aggregate 10mm', sku: 'TEST-AGG-CR-10', category: 'aggregate', description: '10mm crushed stone', unit: 'tons', unitPrice: 42.00, taxRate: 0.15, stockQuantity: 1500, reorderLevel: 400, isActive: true },
      { name: 'Fine Aggregate 5mm', sku: 'TEST-AGG-FN-05', category: 'aggregate', description: '5mm fine crushed stone', unit: 'tons', unitPrice: 38.00, taxRate: 0.15, stockQuantity: 1200, reorderLevel: 300, isActive: true },
      { name: 'Gravel 40mm', sku: 'TEST-AGG-GR-40', category: 'aggregate', description: 'Large gravel for drainage', unit: 'tons', unitPrice: 50.00, taxRate: 0.15, stockQuantity: 800, reorderLevel: 200, isActive: true },
      
      // Sand Products
      { name: 'Coarse Sand', sku: 'TEST-SND-CR-001', category: 'sand', description: 'Coarse sand for concrete', unit: 'm3', unitPrice: 40.00, taxRate: 0.15, stockQuantity: 2500, reorderLevel: 600, isActive: true },
      { name: 'Plaster Sand', sku: 'TEST-SND-PL-001', category: 'sand', description: 'Fine sand for plastering', unit: 'm3', unitPrice: 32.00, taxRate: 0.15, stockQuantity: 1800, reorderLevel: 400, isActive: true },
      { name: 'Washed Sand', sku: 'TEST-SND-WS-001', category: 'sand', description: 'Clean washed sand', unit: 'm3', unitPrice: 38.00, taxRate: 0.15, stockQuantity: 2000, reorderLevel: 500, isActive: true },
      
      // Other Products
      { name: 'Ready Mix Concrete M20', sku: 'TEST-OTH-RMC-M20', category: 'other', description: 'Standard grade concrete', unit: 'm3', unitPrice: 160.00, taxRate: 0.15, stockQuantity: 400, reorderLevel: 100, isActive: true },
      { name: 'Ready Mix Concrete M40', sku: 'TEST-OTH-RMC-M40', category: 'other', description: 'High strength concrete', unit: 'm3', unitPrice: 200.00, taxRate: 0.15, stockQuantity: 300, reorderLevel: 80, isActive: true },
      { name: 'Masonry Mortar', sku: 'TEST-OTH-MOR-001', category: 'other', description: 'Pre-mixed mortar', unit: 'bags', unitPrice: 18.50, taxRate: 0.15, stockQuantity: 3500, reorderLevel: 800, isActive: true },
      { name: 'Tile Adhesive', sku: 'TEST-OTH-ADH-001', category: 'other', description: 'High-bond tile adhesive', unit: 'bags', unitPrice: 22.00, taxRate: 0.15, stockQuantity: 2200, reorderLevel: 500, isActive: true },
      { name: 'Waterproofing Compound', sku: 'TEST-OTH-WPC-001', category: 'other', description: 'Liquid waterproofing', unit: 'kg', unitPrice: 65.00, taxRate: 0.15, stockQuantity: 600, reorderLevel: 150, isActive: true }
    ];

    productsData.forEach(product => {
      product.createdAt = randomDate(new Date(2025, 0, 1), new Date(2025, 8, 1));
      product.updatedAt = new Date();
    });

    const productResults = await db.collection('products').insertMany(productsData);
    const productIds = Object.values(productResults.insertedIds);
    const productDocs = productsData.map((p, i) => ({ ...p, _id: productIds[i] }));
    console.log(`  ✓ Created ${productsData.length} products`);

    // ========== SEED ORDERS ==========
    console.log('\n[3/5] Seeding Orders...');

    const ordersData = [];
    const statuses = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'];

    // Create 50 test orders
    for (let i = 1; i <= 50; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const orderDate = randomDate(new Date(2025, 0, 1), new Date());
      
      // Random number of items (2-5)
      const numItems = Math.floor(Math.random() * 4) + 2;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = productDocs[Math.floor(Math.random() * productDocs.length)];
        const quantity = Math.floor(Math.random() * 100) + 10;
        const lineTotal = +(quantity * product.unitPrice).toFixed(2);
        subtotal += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          unit: product.unit,
          quantity,
          unitPrice: product.unitPrice,
          lineTotal
        });
      }

      const tax = +(subtotal * 0.15).toFixed(2);
      const total = +(subtotal + tax).toFixed(2);

      // Determine status based on order age
      const daysSinceOrder = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      let status;
      let deliveredAt = null;
      let cancelledAt = null;
      let deliveryETA = null;

      if (daysSinceOrder > 30) {
        status = Math.random() > 0.1 ? 'Delivered' : 'Cancelled';
        if (status === 'Delivered') {
          deliveredAt = new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        } else {
          cancelledAt = new Date(orderDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
        }
      } else if (daysSinceOrder > 7) {
        status = Math.random() > 0.2 ? 'Delivered' : 'Out for Delivery';
        if (status === 'Delivered') {
          deliveredAt = new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        } else {
          deliveryETA = new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000);
        }
      } else if (daysSinceOrder > 2) {
        status = Math.random() > 0.3 ? 'Confirmed' : 'Out for Delivery';
        deliveryETA = new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      } else {
        status = Math.random() > 0.5 ? 'Pending' : 'Confirmed';
        deliveryETA = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      }

      const timeline = [
        { status: 'Pending', at: orderDate, note: 'Order placed' }
      ];

      if (status !== 'Pending') {
        timeline.push({ 
          status: 'Confirmed', 
          at: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000), 
          note: 'Order confirmed by admin' 
        });
      }

      if (status === 'Out for Delivery' || status === 'Delivered') {
        timeline.push({ 
          status: 'Out for Delivery', 
          at: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), 
          note: 'Order dispatched for delivery' 
        });
      }

      if (status === 'Delivered') {
        timeline.push({ 
          status: 'Delivered', 
          at: deliveredAt, 
          note: 'Order delivered successfully' 
        });
      }

      if (status === 'Cancelled') {
        timeline.push({ 
          status: 'Cancelled', 
          at: cancelledAt, 
          note: 'Order cancelled by customer' 
        });
      }

      const order = {
        orderNumber: generateOrderNumber(i),
        customer: customerId,
        status,
        items: orderItems,
        subtotal,
        tax,
        total,
        currency: 'SAR',
        deliveryAddress: {
          line1: `Construction Site ${i}`,
          line2: `Phase ${Math.floor(Math.random() * 3) + 1}`,
          city: cities[Math.floor(Math.random() * cities.length)],
          notes: 'Deliver to site office'
        },
        deliveryETA,
        deliveredAt,
        cancelledAt,
        cancellationReason: status === 'Cancelled' ? 'Customer requested cancellation' : null,
        timeline,
        createdAt: orderDate,
        updatedAt: new Date()
      };

      ordersData.push(order);
    }

    const orderResults = await db.collection('orders').insertMany(ordersData);
    const orderIds = Object.values(orderResults.insertedIds);
    console.log(`  ✓ Created ${ordersData.length} orders`);

    // ========== SEED INVOICES ==========
    console.log('\n[4/5] Seeding Invoices...');

    const invoicesData = [];
    const invoiceStatuses = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

    // Create invoices for confirmed and delivered orders
    ordersData.forEach((order, index) => {
      if (order.status === 'Confirmed' || order.status === 'Delivered' || order.status === 'Out for Delivery') {
        const daysSinceOrder = Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24));
        const dueDate = new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isOverdue = new Date() > dueDate;

        let status;
        let amountPaid = 0;
        let paidAt = null;

        if (order.status === 'Delivered') {
          if (isOverdue) {
            const rand = Math.random();
            if (rand > 0.7) {
              status = 'Paid';
              amountPaid = order.total;
              paidAt = randomDate(order.deliveredAt, new Date());
            } else if (rand > 0.4) {
              status = 'Partially Paid';
              amountPaid = +(order.total * (Math.random() * 0.5 + 0.3)).toFixed(2);
            } else {
              status = 'Overdue';
            }
          } else {
            const rand = Math.random();
            if (rand > 0.5) {
              status = 'Paid';
              amountPaid = order.total;
              paidAt = randomDate(order.deliveredAt, new Date());
            } else if (rand > 0.3) {
              status = 'Partially Paid';
              amountPaid = +(order.total * (Math.random() * 0.6 + 0.2)).toFixed(2);
            } else {
              status = 'Sent';
            }
          }
        } else {
          status = Math.random() > 0.5 ? 'Sent' : 'Draft';
        }

        const timeline = [
          { status: 'Draft', at: order.createdAt, note: 'Invoice created' }
        ];

        if (status !== 'Draft') {
          timeline.push({ 
            status: 'Sent', 
            at: new Date(order.createdAt.getTime() + 4 * 60 * 60 * 1000), 
            note: 'Invoice sent to customer' 
          });
        }

        if (status === 'Partially Paid') {
          timeline.push({ 
            status: 'Partially Paid', 
            at: randomDate(order.createdAt, new Date()), 
            note: `Partial payment received: ${amountPaid.toFixed(2)} SAR` 
          });
        }

        if (status === 'Paid') {
          timeline.push({ 
            status: 'Paid', 
            at: paidAt, 
            note: 'Payment received in full' 
          });
        }

        const invoice = {
          invoiceNumber: generateInvoiceNumber(index + 1),
          order: orderIds[index],
          customer: order.customer,
          status,
          items: order.items.map(item => ({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          currency: 'SAR',
          amountPaid,
          dueDate,
          paidAt,
          notes: 'Payment terms: 30 days net',
          timeline,
          createdAt: order.createdAt,
          updatedAt: new Date()
        };

        invoicesData.push(invoice);
      }
    });

    if (invoicesData.length > 0) {
      await db.collection('invoices').insertMany(invoicesData);
      console.log(`  ✓ Created ${invoicesData.length} invoices`);
    }

    // ========== SEED INVENTORY TRANSACTIONS ==========
    console.log('\n[5/5] Seeding Inventory Transactions...');

    const transactionsData = [];

    // Create some inventory transactions
    productDocs.forEach(product => {
      // Initial stock inbound
      transactionsData.push({
        product: product._id,
        type: 'INBOUND',
        quantity: product.stockQuantity,
        beforeQuantity: 0,
        afterQuantity: product.stockQuantity,
        reason: 'Initial stock',
        reference: 'INIT-STOCK',
        performedBy: userIds[0], // Admin
        createdAt: product.createdAt,
        updatedAt: product.createdAt
      });

      // Random adjustments
      const numAdjustments = Math.floor(Math.random() * 3) + 1;
      let currentStock = product.stockQuantity;

      for (let i = 0; i < numAdjustments; i++) {
        const adjustmentType = Math.random() > 0.5 ? 'INBOUND' : 'OUTBOUND';
        const quantity = Math.floor(Math.random() * 200) + 50;
        const beforeQty = currentStock;
        
        if (adjustmentType === 'INBOUND') {
          currentStock += quantity;
        } else {
          currentStock = Math.max(0, currentStock - quantity);
        }

        transactionsData.push({
          product: product._id,
          type: adjustmentType,
          quantity: adjustmentType === 'INBOUND' ? quantity : -quantity,
          beforeQuantity: beforeQty,
          afterQuantity: currentStock,
          reason: adjustmentType === 'INBOUND' ? 'Stock replenishment' : 'Order fulfillment',
          reference: adjustmentType === 'INBOUND' ? 'RESTOCK' : generateOrderNumber(Math.floor(Math.random() * 50) + 1),
          performedBy: userIds[0],
          createdAt: randomDate(product.createdAt, new Date()),
          updatedAt: new Date()
        });
      }
    });

    await db.collection('inventorytransactions').insertMany(transactionsData);
    console.log(`  ✓ Created ${transactionsData.length} inventory transactions`);

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('Seeding Complete! Database Summary:');
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
    console.log('Test Credentials:');
    console.log('  Admin:     test.admin@csms.com / test123');
    console.log('  Customer1: test.customer1@example.com / test123');
    console.log('  Customer2: test.customer2@example.com / test123');
    console.log('  ... (8 customer accounts total)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run seeding
seedTestData()
  .then(() => {
    console.log('\n✅ Test data seeding completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
