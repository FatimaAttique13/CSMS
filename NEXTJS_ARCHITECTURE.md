# CSMS - Construction Supply Management System
## Next.js Full-Stack Architecture

A modern construction supply management system built entirely with **Next.js 15** (no Express needed!).

---

## 🏗️ Project Structure

```
client/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Backend API Routes
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   │   ├── login/        # POST /api/auth/login
│   │   │   │   ├── signup/       # POST /api/auth/signup
│   │   │   │   └── verify/       # GET /api/auth/verify
│   │   │   ├── products/         # Product CRUD
│   │   │   │   ├── route.ts      # GET, POST /api/products
│   │   │   │   └── [id]/         # GET, PUT, DELETE /api/products/:id
│   │   │   ├── orders/           # Order management
│   │   │   │   ├── route.ts      # GET, POST /api/orders
│   │   │   │   └── [id]/         # GET, PATCH, DELETE /api/orders/:id
│   │   │   └── reports/          # Admin reports
│   │   │       ├── upload/       # POST /api/reports/upload
│   │   │       └── sample/       # GET /api/reports/sample
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout with Providers
│   │   └── page.tsx              # Homepage
│   ├── components/               # React components
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── Login.jsx             # Login form
│   │   ├── Signup.jsx            # Signup form
│   │   ├── Products.jsx          # Product catalog
│   │   ├── PlaceOrder.jsx        # Order creation
│   │   ├── TrackOrder.jsx        # Order tracking
│   │   ├── OrderHistory.jsx      # Order list
│   │   ├── CustomerDashboard.jsx # Customer overview
│   │   ├── RequireAuth.jsx       # Auth wrapper
│   │   └── Providers.tsx         # Context providers
│   ├── admin/                    # Admin components
│   │   ├── AdminReports.tsx      # Excel upload & display
│   │   ├── AdminAnalytics.tsx    # Analytics dashboard
│   │   ├── AdminInvoices.tsx     # Invoice management
│   │   └── Inventory.tsx         # Stock management
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx       # Authentication state
│   ├── lib/                      # Utilities
│   │   └── mongodb.ts            # 🔥 MongoDB connection (singleton)
│   └── models/                   # 🔥 Mongoose models (JavaScript)
│       ├── User.js               # User schema with bcrypt
│       ├── Product.js            # Product schema
│       ├── Order.js              # Order schema
│       ├── Invoice.js            # Invoice schema
│       ├── Payment.js            # Payment schema
│       └── InventoryTransaction.js # Stock audit trail
├── public/                       # Static assets
├── .env.local                    # 🔥 Environment variables
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config

scripts/                          # Database utilities
├── setup_csms.js                 # Initialize MongoDB
├── setup_csms_mongosh.js         # MongoDB Compass version
└── seed_test_data.js             # Generate test data
```

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 4.x** - Styling with glassmorphism
- **Lucide React 0.545.0** - Icons

### Backend (All in Next.js!)
- **Next.js API Routes** - RESTful API endpoints
- **Mongoose 8.8.1** - MongoDB ODM
- **bcryptjs 2.4.3** - Password hashing
- **xlsx 0.18.5** - Excel file parsing

### Database
- **MongoDB Atlas** - Cloud database
- Connection: `mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db`

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Setup

The `.env.local` file is already configured with:
```env
MONGODB_URI=mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Initialize Database (First Time Only)

```bash
# Run from project root
node scripts/setup_csms.js
```

This creates collections, indexes, and sample data.

### 4. (Optional) Seed Test Data

```bash
node scripts/seed_test_data.js
```

Generates 50 orders, 15 products, and 9 users.

### 5. Start Development Server

```bash
cd client
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| GET | `/api/auth/verify?userId=xxx` | Verify user session |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products?category=cement` | Filter by category |
| GET | `/api/products?search=keyword` | Search products |
| POST | `/api/products` | Create product |
| GET | `/api/products/[id]` | Get single product |
| PUT | `/api/products/[id]` | Update product |
| DELETE | `/api/products/[id]` | Soft delete product |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders?customerId=xxx` | Filter by customer |
| GET | `/api/orders?status=Pending` | Filter by status |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/[id]` | Get single order |
| PATCH | `/api/orders/[id]` | Update order status |
| DELETE | `/api/orders/[id]` | Cancel order |

### Reports (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/upload` | Upload Excel report |
| GET | `/api/reports/sample` | Get sample data |

---

## 🎯 How It Works (No Express!)

### MongoDB Connection (`lib/mongodb.ts`)

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

// Singleton pattern - reuse connection across hot reloads
let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

### API Route Example (`api/products/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  await connectDB();  // Connect to MongoDB
  
  const products = await Product.find({});
  
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  await connectDB();
  
  const body = await request.json();
  const product = await Product.create(body);
  
  return NextResponse.json({ product }, { status: 201 });
}
```

### Model Example (`models/Product.js`)

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, enum: ['cement', 'aggregate', 'sand', 'other'] },
  unitPrice: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent recompilation in Next.js hot reload
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
```

---

## 🔐 Authentication Flow

1. **Signup** → POST `/api/auth/signup`
   - Password hashed with bcrypt (pre-save hook)
   - User created in MongoDB

2. **Login** → POST `/api/auth/login`
   - Email lookup
   - Password comparison with `comparePassword()` method
   - Returns user object (no password)

3. **Session** → Stored in localStorage (client-side demo)
   - Frontend: `AuthContext.tsx` manages state
   - Protected routes: `RequireAuth.jsx` wrapper

---

## 📊 Admin Reports Feature

Upload Excel files with this format:

| Months | Value | Tons | Cost of Sales | Transport | Margin | A/GM/Ton | Expenses | Net Profit |
|--------|-------|------|---------------|-----------|---------|----------|----------|------------|
| Jan 2025 | 456732.65 | 5234.12 | 298450.50 | 45678.30 | 112603.85 | 21.51 | 32500.00 | 80103.85 |

The system will:
- ✅ Parse Excel file using `xlsx` library
- ✅ Display monthly breakdown table
- ✅ Show key metrics (Sales, Tons, Margin, Net Profit)
- ✅ Highlight performance (green/red indicators)
- ✅ Export to CSV

---

## 🗄️ Database Collections

### users
- Authentication with bcrypt
- Roles: `customer`, `admin`
- Profile info and addresses

### products
- SKU, category, pricing
- Stock tracking
- Tax rate (default 15%)

### orders
- Order items (snapshot at purchase)
- Status workflow
- Timeline tracking
- Payment status

### invoices
- Linked to orders
- Payment tracking
- Due dates, balance calculation

### inventorytransactions
- INBOUND/OUTBOUND/ADJUSTMENT
- Audit trail for stock changes

---

## 🎨 UI Features

- **Glassmorphic Design** - Modern backdrop-blur effects
- **Responsive** - Mobile-first design
- **Dark Mode Ready** - Gradient backgrounds
- **Animations** - Smooth transitions
- **SAR Currency** - Saudi Riyal formatting

---

## 📝 Default Users

Created by `setup_csms.js`:

| Email | Password | Role |
|-------|----------|------|
| admin@csms.com | admin123 | admin |
| test.admin@csms.com | test123 | admin |
| customer@csms.com | customer123 | customer |

---

## 🚧 Development Tips

### Hot Reload Issue?
The models use `mongoose.models.X || mongoose.model()` to prevent recompilation.

### Connection Pool?
The `mongodb.ts` singleton ensures one connection across all API routes.

### CORS?
Not needed! Frontend and backend are on the same origin (`localhost:3000`).

### File Uploads?
Next.js API routes handle `FormData` natively - no `multer` needed for basic uploads.

---

## 🔮 Future Enhancements

- [ ] JWT authentication instead of localStorage
- [ ] Stripe payment integration (models ready!)
- [ ] Real-time order tracking with WebSockets
- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Advanced analytics charts
- [ ] Multi-warehouse support

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ✅ Why No Express?

**Next.js IS your full-stack framework:**
- ✅ API Routes = Express routes
- ✅ Built-in routing
- ✅ Server-side rendering
- ✅ File-based structure
- ✅ Optimized production builds
- ✅ One `package.json`, one server

**Result:** Simpler, faster, more maintainable! 🚀

---

**Built with ❤️ using Next.js 15**
