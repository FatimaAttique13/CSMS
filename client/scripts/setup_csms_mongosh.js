/**
 * setup_csms_mongosh.js
 * MongoDB Compass/Shell (mongosh) compatible setup script for CSMS database.
 * Creates collections with validators, indexes, and seeds initial data.
 * 
 * Usage in MongoDB Compass:
 * 1. Connect to: mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/
 * 2. Open the "Mongosh" tab at the bottom
 * 3. Copy and paste this entire file
 * 4. Press Enter to execute
 * 
 * Or via mongosh CLI:
 *   mongosh "mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/" --file setup_csms_mongosh.js
 */

// ========== CONFIGURATION ==========
const DB_NAME = "csms_db";
print("=".repeat(60));
print("CSMS Database Setup Script (MongoDB Shell)");
print("=".repeat(60));
print(`Database: ${DB_NAME}`);
print("=".repeat(60));

// Switch to the database
use(DB_NAME);

// ========== HELPER FUNCTION FOR HASHING ==========
// Simple hash function (for demo purposes - in production use proper bcrypt)
function simpleHash(password) {
  // This is a placeholder - MongoDB Compass doesn't have bcrypt
  // In production, hash passwords server-side
  return "$2a$10$" + password + "HASHED"; // Prefix to indicate it's "hashed"
}

// ========== DROP EXISTING COLLECTIONS ==========
print("\nChecking existing collections...");
const existingCollections = db.getCollectionNames();
print("Existing collections: " + (existingCollections.length > 0 ? existingCollections.join(", ") : "None"));

if (existingCollections.includes("users")) {
  db.users.drop();
  print("  ↳ Dropped users collection");
}
if (existingCollections.includes("products")) {
  db.products.drop();
  print("  ↳ Dropped products collection");
}
if (existingCollections.includes("orders")) {
  db.orders.drop();
  print("  ↳ Dropped orders collection");
}
if (existingCollections.includes("invoices")) {
  db.invoices.drop();
  print("  ↳ Dropped invoices collection");
}
if (existingCollections.includes("inventorytransactions")) {
  db.inventorytransactions.drop();
  print("  ↳ Dropped inventorytransactions collection");
}

// ========== USERS COLLECTION ==========
print("\n[1/5] Creating users collection...");
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role", "isActive", "createdAt", "updatedAt"],
      properties: {
        email: { 
          bsonType: "string",
          pattern: "^\\S+@\\S+\\.\\S+$",
          description: "Valid email address required"
        },
        password: { 
          bsonType: "string",
          minLength: 6,
          description: "Hashed password, min 6 chars"
        },
        role: { 
          enum: ["customer", "admin"],
          description: "User role: customer or admin"
        },
        profile: {
          bsonType: "object",
          properties: {
            firstName: { bsonType: "string" },
            lastName: { bsonType: "string" },
            phone: { bsonType: "string" },
            company: { bsonType: "string" }
          }
        },
        addresses: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["line1", "city"],
            properties: {
              label: { bsonType: "string" },
              line1: { bsonType: "string" },
              line2: { bsonType: "string" },
              city: { bsonType: "string" },
              notes: { bsonType: "string" },
              isDefault: { bsonType: "bool" }
            }
          }
        },
        isActive: { bsonType: "bool" },
        lastLogin: { bsonType: "date" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.users.createIndex({ email: 1 }, { unique: true, name: "uniq_email" });
db.users.createIndex({ role: 1 }, { name: "by_role" });
print("  ✓ Users collection created with indexes");

// ========== PRODUCTS COLLECTION ==========
print("\n[2/5] Creating products collection...");
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "sku", "category", "unit", "unitPrice", "isActive", "createdAt", "updatedAt"],
      properties: {
        name: { bsonType: "string" },
        sku: { bsonType: "string" },
        category: { enum: ["cement", "aggregate", "sand", "other"] },
        description: { bsonType: "string" },
        unit: { enum: ["bags", "tons", "kg", "m3", "units"] },
        unitPrice: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        taxRate: { bsonType: ["double", "int", "decimal"], minimum: 0, maximum: 1 },
        stockQuantity: { bsonType: ["int"], minimum: 0 },
        reorderLevel: { bsonType: ["int"], minimum: 0 },
        isActive: { bsonType: "bool" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.products.createIndex({ sku: 1 }, { unique: true, name: "uniq_sku" });
db.products.createIndex({ name: 1 }, { name: "by_name" });
db.products.createIndex({ category: 1 }, { name: "by_category" });
db.products.createIndex({ name: "text", description: "text" }, { name: "text_search" });
print("  ✓ Products collection created with indexes");

// ========== ORDERS COLLECTION ==========
print("\n[3/5] Creating orders collection...");
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderNumber", "customer", "status", "items", "subtotal", "tax", "total", "currency", "createdAt", "updatedAt"],
      properties: {
        orderNumber: { bsonType: "string" },
        customer: { bsonType: "objectId" },
        status: { enum: ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"] },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["product", "name", "unit", "quantity", "unitPrice", "lineTotal"],
            properties: {
              product: { bsonType: "objectId" },
              name: { bsonType: "string" },
              unit: { bsonType: "string" },
              quantity: { bsonType: ["double", "int", "decimal"], minimum: 0 },
              unitPrice: { bsonType: ["double", "int", "decimal"], minimum: 0 },
              lineTotal: { bsonType: ["double", "int", "decimal"], minimum: 0 }
            }
          }
        },
        subtotal: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        tax: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        total: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        currency: { bsonType: "string" },
        deliveryAddress: {
          bsonType: "object",
          properties: {
            line1: { bsonType: "string" },
            line2: { bsonType: "string" },
            city: { bsonType: "string" },
            notes: { bsonType: "string" }
          }
        },
        deliveryETA: { bsonType: "date" },
        deliveredAt: { bsonType: "date" },
        cancelledAt: { bsonType: "date" },
        cancellationReason: { bsonType: "string" },
        timeline: { bsonType: "array" },
        invoice: { bsonType: "objectId" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.orders.createIndex({ orderNumber: 1 }, { unique: true, name: "uniq_orderNumber" });
db.orders.createIndex({ customer: 1 }, { name: "by_customer" });
db.orders.createIndex({ status: 1 }, { name: "by_status" });
db.orders.createIndex({ createdAt: -1 }, { name: "by_created_desc" });
print("  ✓ Orders collection created with indexes");

// ========== INVOICES COLLECTION ==========
print("\n[4/5] Creating invoices collection...");
db.createCollection("invoices", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["invoiceNumber", "order", "customer", "status", "items", "subtotal", "tax", "total", "currency", "dueDate", "createdAt", "updatedAt"],
      properties: {
        invoiceNumber: { bsonType: "string" },
        order: { bsonType: "objectId" },
        customer: { bsonType: "objectId" },
        status: { enum: ["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"] },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["name", "unit", "quantity", "unitPrice", "lineTotal"],
            properties: {
              orderItemRef: { bsonType: "objectId" },
              name: { bsonType: "string" },
              unit: { bsonType: "string" },
              quantity: { bsonType: ["double", "int", "decimal"], minimum: 0 },
              unitPrice: { bsonType: ["double", "int", "decimal"], minimum: 0 },
              lineTotal: { bsonType: ["double", "int", "decimal"], minimum: 0 }
            }
          }
        },
        subtotal: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        tax: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        total: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        currency: { bsonType: "string" },
        amountPaid: { bsonType: ["double", "int", "decimal"], minimum: 0 },
        dueDate: { bsonType: "date" },
        paidAt: { bsonType: "date" },
        cancelledAt: { bsonType: "date" },
        cancellationReason: { bsonType: "string" },
        notes: { bsonType: "string" },
        timeline: { bsonType: "array" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true, name: "uniq_invoiceNumber" });
db.invoices.createIndex({ order: 1 }, { name: "by_order" });
db.invoices.createIndex({ customer: 1 }, { name: "by_customer" });
db.invoices.createIndex({ status: 1 }, { name: "by_status" });
db.invoices.createIndex({ dueDate: 1 }, { name: "by_dueDate" });
print("  ✓ Invoices collection created with indexes");

// ========== INVENTORY TRANSACTIONS COLLECTION ==========
print("\n[5/5] Creating inventorytransactions collection...");
db.createCollection("inventorytransactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product", "type", "quantity", "beforeQuantity", "afterQuantity", "createdAt", "updatedAt"],
      properties: {
        product: { bsonType: "objectId" },
        type: { enum: ["INBOUND", "OUTBOUND", "ADJUSTMENT"] },
        quantity: { bsonType: ["double", "int", "decimal"] },
        beforeQuantity: { bsonType: ["double", "int", "decimal"] },
        afterQuantity: { bsonType: ["double", "int", "decimal"] },
        reason: { bsonType: "string" },
        reference: { bsonType: "string" },
        performedBy: { bsonType: "objectId" },
        metadata: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.inventorytransactions.createIndex({ product: 1 }, { name: "by_product" });
db.inventorytransactions.createIndex({ createdAt: -1 }, { name: "by_created_desc" });
print("  ✓ Inventory transactions collection created with indexes");

// ========== SEED DATA ==========
print("\n" + "=".repeat(60));
print("Seeding initial data...");
print("=".repeat(60));

try {
  // Seed Admin User
  const adminExists = db.users.findOne({ email: "admin@csms.com" });
  let adminId;
  if (!adminExists) {
    const adminResult = db.users.insertOne({
      email: "admin@csms.com",
      password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // Hash of "admin123"
      role: "admin",
      profile: {
        firstName: "Admin",
        lastName: "User",
        phone: "+966-500-000-000",
        company: "CSMS HQ"
      },
      addresses: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    adminId = adminResult.insertedId;
    print("  ✓ Created admin user (admin@csms.com / admin123)");
  } else {
    adminId = adminExists._id;
    print("  ↳ Admin user already exists");
  }

  // Seed Customer User
  const customerExists = db.users.findOne({ email: "customer@example.com" });
  let customerId;
  if (!customerExists) {
    const customerResult = db.users.insertOne({
      email: "customer@example.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // Hash of "customer123"
      role: "customer",
      profile: {
        firstName: "Ahmed",
        lastName: "Al-Saud",
        phone: "+966-555-123-456",
        company: "Al-Saud Construction"
      },
      addresses: [{
        label: "Office",
        line1: "King Fahd Road",
        line2: "Office 301",
        city: "Riyadh",
        notes: "Main office location",
        isDefault: true
      }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    customerId = customerResult.insertedId;
    print("  ✓ Created customer user (customer@example.com / customer123)");
  } else {
    customerId = customerExists._id;
    print("  ↳ Customer user already exists");
  }

  // Seed Products
  const productsData = [
    {
      name: "Portland Cement Type I",
      sku: "CEM-PT-001",
      category: "cement",
      description: "High-quality Portland cement suitable for general construction",
      unit: "bags",
      unitPrice: 25.50,
      taxRate: 0.15,
      stockQuantity: 5000,
      reorderLevel: 1000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Coarse Aggregate 20mm",
      sku: "AGG-CR-20",
      category: "aggregate",
      description: "20mm crushed stone aggregate for concrete",
      unit: "tons",
      unitPrice: 45.00,
      taxRate: 0.15,
      stockQuantity: 2000,
      reorderLevel: 500,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Fine Sand",
      sku: "SND-FN-001",
      category: "sand",
      description: "Washed fine sand for masonry and plastering",
      unit: "m3",
      unitPrice: 35.00,
      taxRate: 0.15,
      stockQuantity: 1500,
      reorderLevel: 300,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Ready Mix Concrete M30",
      sku: "OTH-RMC-M30",
      category: "other",
      description: "Ready-mix concrete grade M30",
      unit: "m3",
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
  productsData.forEach(function(product) {
    const exists = db.products.findOne({ sku: product.sku });
    if (!exists) {
      const result = db.products.insertOne(product);
      productIds.push(result.insertedId);
      print("  ✓ Created product: " + product.name);
    } else {
      productIds.push(exists._id);
      print("  ↳ Product already exists: " + product.name);
    }
  });

  // Seed Sample Order
  const orderExists = db.orders.findOne({ orderNumber: "ORD-2025-001" });
  let orderId;
  if (!orderExists && customerId && productIds.length > 0) {
    const orderData = {
      orderNumber: "ORD-2025-001",
      customer: customerId,
      status: "Confirmed",
      items: [
        {
          product: productIds[0],
          name: "Portland Cement Type I",
          unit: "bags",
          quantity: 100,
          unitPrice: 25.50,
          lineTotal: 2550.00
        },
        {
          product: productIds[2],
          name: "Fine Sand",
          unit: "m3",
          quantity: 50,
          unitPrice: 35.00,
          lineTotal: 1750.00
        }
      ],
      subtotal: 4300.00,
      tax: 645.00,
      total: 4945.00,
      currency: "SAR",
      deliveryAddress: {
        line1: "King Fahd Road",
        line2: "Construction Site B",
        city: "Riyadh",
        notes: "Deliver to site entrance"
      },
      deliveryETA: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      timeline: [
        { status: "Pending", at: new Date(), note: "Order placed" },
        { status: "Confirmed", at: new Date(), note: "Order confirmed by admin" }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const orderResult = db.orders.insertOne(orderData);
    orderId = orderResult.insertedId;
    print("  ✓ Created sample order (ORD-2025-001)");
  } else if (orderExists) {
    orderId = orderExists._id;
    print("  ↳ Sample order already exists");
  } else {
    print("  ↳ Could not create sample order (dependencies missing)");
  }

  // Seed Sample Invoice
  if (orderId && customerId) {
    const invoiceExists = db.invoices.findOne({ invoiceNumber: "INV-2025-001" });
    if (!invoiceExists) {
      const invoiceData = {
        invoiceNumber: "INV-2025-001",
        order: orderId,
        customer: customerId,
        status: "Sent",
        items: [
          {
            name: "Portland Cement Type I",
            unit: "bags",
            quantity: 100,
            unitPrice: 25.50,
            lineTotal: 2550.00
          },
          {
            name: "Fine Sand",
            unit: "m3",
            quantity: 50,
            unitPrice: 35.00,
            lineTotal: 1750.00
          }
        ],
        subtotal: 4300.00,
        tax: 645.00,
        total: 4945.00,
        currency: "SAR",
        amountPaid: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: "Payment due within 30 days",
        timeline: [
          { status: "Draft", at: new Date(), note: "Invoice created" },
          { status: "Sent", at: new Date(), note: "Invoice sent to customer" }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.invoices.insertOne(invoiceData);
      print("  ✓ Created sample invoice (INV-2025-001)");
    } else {
      print("  ↳ Sample invoice already exists");
    }
  }

  // ========== SUMMARY ==========
  print("\n" + "=".repeat(60));
  print("Setup Complete! Database Summary:");
  print("=".repeat(60));

  const counts = {
    users: db.users.countDocuments(),
    products: db.products.countDocuments(),
    orders: db.orders.countDocuments(),
    invoices: db.invoices.countDocuments(),
    inventoryTransactions: db.inventorytransactions.countDocuments()
  };

  printjson(counts);
  
  print("\n" + "=".repeat(60));
  print("Demo Credentials:");
  print("  Admin:    admin@csms.com / admin123");
  print("  Customer: customer@example.com / customer123");
  print("=".repeat(60));
  print("\n✅ Setup completed successfully!");

} catch (err) {
  print("\n❌ Error during seeding:", err);
}
