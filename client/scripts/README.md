# CSMS Database Setup Scripts

This directory contains database initialization and management scripts for the CSMS (Construction Supply Management System).

## 📄 Available Scripts

### `setup_csms.js`

One-time setup script that initializes the MongoDB database with:
- **Collections with schema validators** (strict validation)
- **Indexes** for optimal query performance
- **Seed data** for development and testing

### `setup_csms_mongosh.js`

MongoDB Compass/Shell compatible version of the setup script. Run directly in MongoDB Compass's Mongosh tab without Node.js dependencies.

### `seed_test_data.js`

Comprehensive test data seeding script that populates the database with:
- **9 users** (1 admin, 8 customers)
- **15 products** across all categories
- **50 orders** with realistic statuses and timelines
- **~35 invoices** with various payment states
- **~60 inventory transactions** for audit trails

## 🚀 Usage

### Prerequisites

1. **MongoDB** must be running (local or cloud)
2. **Node.js** and **npm** installed
3. **Dependencies** installed in the server directory

### Environment Setup

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/csms_db
MONGODB_DB_NAME=csms_db
```

Or use the default values:
- **URI**: `mongodb://localhost:27017/csms_db`
- **DB Name**: `csms_db`

### Running the Setup Script

From the `server/` directory:

```bash
# Install dependencies (if not already done)
npm install mongoose bcryptjs dotenv

# Run the setup script
node scripts/setup_csms.js
```

### Expected Output

```
============================================================
CSMS Database Setup Script
============================================================
Database: csms_db
URI: mongodb://localhost:27017/csms_db
============================================================
✓ Connected to MongoDB

Existing collections: None

[1/5] Creating users collection...
  ✓ Users collection created with indexes

[2/5] Creating products collection...
  ✓ Products collection created with indexes

[3/5] Creating orders collection...
  ✓ Orders collection created with indexes

[4/5] Creating invoices collection...
  ✓ Invoices collection created with indexes

[5/5] Creating inventorytransactions collection...
  ✓ Inventory transactions collection created with indexes

============================================================
Seeding initial data...
============================================================
  ✓ Created admin user (admin@csms.com / admin123)
  ✓ Created customer user (customer@example.com / customer123)
  ✓ Created product: Portland Cement Type I
  ✓ Created product: Coarse Aggregate 20mm
  ✓ Created product: Fine Sand
  ✓ Created product: Ready Mix Concrete M30
  ✓ Created sample order (ORD-2025-001)
  ✓ Created sample invoice (INV-2025-001)

============================================================
Setup Complete! Database Summary:
============================================================
{
  "users": 2,
  "products": 4,
  "orders": 1,
  "invoices": 1,
  "inventoryTransactions": 0
}

============================================================
Demo Credentials:
  Admin:    admin@csms.com / admin123
  Customer: customer@example.com / customer123
============================================================

✓ Database connection closed

✅ Setup completed successfully!
```

## 📊 Created Collections

### 1. **users**
- Email/password authentication with bcrypt hashing
- Role-based access (customer/admin)
- Profile information and addresses
- **Indexes**: `email` (unique), `role`

### 2. **products**
- Construction materials catalog
- Categories: cement, aggregate, sand, other
- Inventory tracking (stock quantity, reorder level)
- **Indexes**: `sku` (unique), `name`, `category`, text search

### 3. **orders**
- Customer orders with line items
- Order status workflow
- Delivery tracking and timeline
- **Indexes**: `orderNumber` (unique), `customer`, `status`, `createdAt`

### 4. **invoices**
- Automated invoicing from orders
- Payment tracking (partial/full)
- Due date management
- **Indexes**: `invoiceNumber` (unique), `order`, `customer`, `status`, `dueDate`

### 5. **inventorytransactions**
- Stock movement audit trail
- Types: INBOUND, OUTBOUND, ADJUSTMENT
- Reference tracking to orders/invoices
- **Indexes**: `product`, `createdAt`

## 🔐 Demo Credentials

After running the setup script, you can use these credentials:

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@csms.com           | admin123     |
| Customer | customer@example.com     | customer123  |

## 🧪 Testing with Sample Data

### Running the Test Data Seeder

After running the setup script, you can populate with comprehensive test data:

```bash
# From server/ directory
node scripts/seed_test_data.js
```

This will create:
- 9 user accounts (1 admin, 8 customers)
- 15 diverse products (cement, aggregate, sand, other)
- 50 orders with realistic statuses
- ~35 invoices with various payment states
- ~60 inventory transactions

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Test Admin | test.admin@csms.com | test123 |
| Test Customer 1 | test.customer1@example.com | test123 |
| Test Customer 2 | test.customer2@example.com | test123 |
| ... | test.customer[3-8]@example.com | test123 |

## 🔄 Re-running Scripts

⚠️ **Warning**: Setup script drops existing collections before creating new ones!

### Reset Database Completely
```bash
node scripts/setup_csms.js
```

### Add Only Test Data (keeps existing data)
```bash
node scripts/seed_test_data.js
```

### Re-seed Test Data (clears test data first)
```bash
# The seed script automatically clears test-* prefixed data
node scripts/seed_test_data.js
```

## 🧪 Seed Data Included

### Users
- 1 Admin user
- 1 Customer user (with address)

### Products
- Portland Cement Type I (5000 bags)
- Coarse Aggregate 20mm (2000 tons)
- Fine Sand (1500 m³)
- Ready Mix Concrete M30 (500 m³)

### Orders
- 1 Sample order (ORD-2025-001) with 2 items
- Status: Confirmed
- Total: 4,945.00 SAR (including 15% tax)

### Invoices
- 1 Sample invoice (INV-2025-001) linked to the order
- Status: Sent
- Due in 30 days

## 🛠️ Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

### Permission Error
```
Error: not authorized on csms_db to execute command
```
**Solution**: Check MongoDB authentication settings or use credentials in connection string.

### Validation Error
```
Document failed validation
```
**Solution**: The script enforces strict schema validation. Check that all required fields are provided.

## 📚 Next Steps

### Quick Start Workflow

1. **Run setup script** (first time only):
   ```bash
   node scripts/setup_csms.js
   ```

2. **Seed test data** (optional but recommended):
   ```bash
   node scripts/seed_test_data.js
   ```

3. **Start your server**:
   ```bash
   npm run dev
   ```

4. **Test the application**:
   - Login as admin: `test.admin@csms.com` / `test123`
   - Login as customer: `test.customer1@example.com` / `test123`
   - Browse products and orders
   - Access admin analytics and invoices

## 🔗 Related Files

- `../models/User.js` - User model with authentication
- `../models/Product.js` - Product catalog model
- `../models/Order.js` - Order management model
- `../models/Invoice.js` - Invoice generation model
- `../models/InventoryTransaction.js` - Stock tracking model
- `../models/index.js` - Model exports

---

**Note**: This script is designed for development and testing. For production deployments, use proper migration tools and backup strategies.
