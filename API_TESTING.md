# 🧪 API Testing Guide

Test your Next.js API routes using these examples.

## Prerequisites

1. Start the dev server:
```bash
cd client
npm run dev
```

2. Server running at: `http://localhost:3000`

---

## Authentication Tests

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "role": "customer",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "phone": "+966501234567"
    }
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@csms.com",
    "password": "admin123"
  }'
```

### 3. Verify User
```bash
curl "http://localhost:3000/api/auth/verify?userId=USER_ID_HERE"
```

---

## Product Tests

### 1. Get All Products
```bash
curl http://localhost:3000/api/products
```

### 2. Filter by Category
```bash
curl "http://localhost:3000/api/products?category=cement"
```

### 3. Search Products
```bash
curl "http://localhost:3000/api/products?search=portland"
```

### 4. Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Portland Cement Type I",
    "sku": "CEM-012",
    "category": "cement",
    "description": "High-quality Portland cement",
    "unit": "bags",
    "unitPrice": 25.50,
    "taxRate": 0.15,
    "stockQuantity": 1000,
    "reorderLevel": 100
  }'
```

### 5. Update Product
```bash
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "unitPrice": 27.00,
    "stockQuantity": 1200
  }'
```

### 6. Delete Product (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/products/PRODUCT_ID
```

---

## Order Tests

### 1. Get All Orders
```bash
curl http://localhost:3000/api/orders
```

### 2. Filter by Customer
```bash
curl "http://localhost:3000/api/orders?customerId=CUSTOMER_ID"
```

### 3. Filter by Status
```bash
curl "http://localhost:3000/api/orders?status=Pending"
```

### 4. Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "USER_ID_HERE",
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 50
      }
    ],
    "deliveryAddress": {
      "line1": "123 Construction Site",
      "city": "Riyadh",
      "notes": "Deliver to gate 2"
    },
    "deliveryETA": "2025-10-20T10:00:00Z"
  }'
```

### 5. Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Confirmed",
    "note": "Order confirmed by admin"
  }'
```

### 6. Cancel Order
```bash
curl -X DELETE "http://localhost:3000/api/orders/ORDER_ID?reason=Customer requested cancellation"
```

---

## Report Tests

### 1. Get Sample Data
```bash
curl http://localhost:3000/api/reports/sample
```

### 2. Upload Excel File
```bash
curl -X POST http://localhost:3000/api/reports/upload \
  -F "file=@/path/to/your/report.xlsx"
```

---

## Using Postman

### Import Collection

Create a new Postman collection with these endpoints:

**Base URL:** `http://localhost:3000`

#### Auth Folder
- POST `{{baseUrl}}/api/auth/signup`
- POST `{{baseUrl}}/api/auth/login`
- GET `{{baseUrl}}/api/auth/verify`

#### Products Folder
- GET `{{baseUrl}}/api/products`
- POST `{{baseUrl}}/api/products`
- GET `{{baseUrl}}/api/products/:id`
- PUT `{{baseUrl}}/api/products/:id`
- DELETE `{{baseUrl}}/api/products/:id`

#### Orders Folder
- GET `{{baseUrl}}/api/orders`
- POST `{{baseUrl}}/api/orders`
- GET `{{baseUrl}}/api/orders/:id`
- PATCH `{{baseUrl}}/api/orders/:id`
- DELETE `{{baseUrl}}/api/orders/:id`

#### Reports Folder
- GET `{{baseUrl}}/api/reports/sample`
- POST `{{baseUrl}}/api/reports/upload`

---

## Testing from Browser Console

### Login Example
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@csms.com',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Get Products Example
```javascript
fetch('http://localhost:3000/api/products')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Expected Responses

### Success Response (200/201)
```json
{
  "message": "Operation successful",
  "data": { /* ... */ }
}
```

### Error Response (4xx/5xx)
```json
{
  "error": "Error message here"
}
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Internal Server Error |

---

## Test Data

Use these credentials created by `setup_csms.js`:

| Email | Password | Role |
|-------|----------|------|
| admin@csms.com | admin123 | admin |
| customer@csms.com | customer123 | customer |

---

## Debugging Tips

### Check Server Logs
```bash
# Development server shows all API requests
npm run dev
```

### Check MongoDB
```bash
# Connect with MongoDB Compass
mongodb+srv://dawood:Dawood123@cluster0.vrp2lje.mongodb.net/csms_db
```

### Check Browser Network Tab
- Open DevTools (F12)
- Network tab
- Filter by "Fetch/XHR"
- Inspect request/response

---

Happy Testing! 🚀
