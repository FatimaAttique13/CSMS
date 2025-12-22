# 📬 Postman API Testing Guide

Complete guide for testing CSMS APIs using the provided Postman collection.



## 📋 Testing Workflow

### Recommended Testing Order

Follow this sequence for comprehensive testing:

#### **Step 1: Authentication Setup**
1. **Signup - New Customer** - Creates a test customer account
2. **Login - Admin** - Login as admin (saves userId for subsequent requests)
3. **Verify User by Email** - Confirms user lookup works

#### **Step 2: Product Management**
1. **Get All Products** - Fetches all products (saves productId)
2. **Get Products by Category** - Tests filtering
3. **Search Products** - Tests search functionality
4. **Create Product** - Creates a new product
5. **Update Product** - Updates the created product
6. **Get Product by ID** - Verifies the product exists
7. **Delete Product** - Soft deletes the product

#### **Step 3: Order Management**
1. **Get All Orders** - Fetches existing orders
2. **Create Order with Customer ID** - Places an order (requires userId and productId)
3. **Create Order with Email** - Places order using email lookup
4. **Get Orders by Customer** - Filters by customer
5. **Get Orders by Status** - Filters by status
6. **Update Order Status** - Changes order to "Confirmed"
7. **Cancel Order** - Cancels the order

#### **Step 4: Reporting**
1. **Get Sample Report Data** - Gets sample data
2. **Upload Excel Report** - Tests file upload (requires manual file selection)

---

## 🎯 Collection Features

### Automatic Variable Management

The collection automatically manages these variables:

| Variable | Description | Set By |
|----------|-------------|--------|
| `baseUrl` | API base URL | Manual/Default |
| `userId` | Logged-in user ID | Login/Signup requests |
| `productId` | Product ID for testing | Get/Create Product |
| `orderId` | Order ID for testing | Get/Create Order |
| `userEmail` | User email address | Login request |

### Built-in Tests

Every request includes automated tests that verify:

✅ **Status Codes** - Ensures correct HTTP response codes  
✅ **Response Structure** - Validates response has required fields  
✅ **Data Integrity** - Checks data matches expected values  
✅ **Response Time** - Verifies API performance (< 3 seconds)  
✅ **Business Logic** - Tests specific business rules

### Pre-request Scripts

Certain requests have pre-request checks:
- Warns if required variables are not set
- Helps identify dependency issues
- Prevents failed requests due to missing data

---

## 📊 Test Results

### Viewing Test Results

After running a request:
1. Check **Test Results** tab at the bottom
2. Green ✓ = Passed tests
3. Red ✗ = Failed tests
4. Review failure details for debugging

### Running All Tests

To run the entire collection:
1. Click on collection name
2. Click **Run** button
3. Select all requests or specific folder
4. Click **Run CSMS API Testing**
5. View comprehensive test report

### Test Reports

Postman shows:
- Total requests executed
- Passed/Failed test count
- Average response time
- Individual request details

---

## 🔧 Common Test Scenarios

### Scenario 1: New User Workflow

```
1. Signup - New Customer
2. Login with new credentials
3. Get All Products
4. Create Order with Email
5. Get Orders by Customer
```

### Scenario 2: Admin Product Management

```
1. Login - Admin
2. Get All Products
3. Create Product
4. Update Product
5. Get Product by ID
6. Delete Product
```

### Scenario 3: Order Processing

```
1. Login - Admin
2. Get All Orders
3. Get Orders by Status (Pending)
4. Update Order Status (Confirmed)
5. Get Orders by Status (Confirmed)
```

### Scenario 4: Customer Journey

```
1. Login - Customer
2. Search Products (keyword)
3. Get Products by Category
4. Create Order with Customer ID
5. Get Orders by Customer
6. Cancel Order
```

---

## 🐛 Troubleshooting

### Problem: "Warning: userId not set"

**Solution:** Run **Login - Admin** or **Login - Customer** first.

### Problem: "Warning: productId not set"

**Solution:** Run **Get All Products** or **Create Product** first.

### Problem: "Connection refused" or timeout

**Solutions:**
- Verify dev server is running (`npm run dev`)
- Check `baseUrl` variable matches your server port
- Confirm MongoDB connection is active

### Problem: "Customer not found" when creating order

**Solution:** 
- Ensure you've logged in first (sets userId)
- Or use **Create Order with Email** with a valid email from database

### Problem: Test fails with "Product not found"

**Solution:**
- Run `node scripts/seed_products_quick.js` to populate products
- Or create products manually using **Create Product** request

### Problem: "Stock insufficient" error

**Solution:** Reduce quantity in order request or update product stock using **Update Product**.

---

## 📝 Request Examples

### Authentication

**Signup:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "customer",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+966501234567"
  }
}
```

**Login:**
```json
{
  "email": "admin@csms.com",
  "password": "admin123"
}
```

### Products

**Create Product:**
```json
{
  "name": "Premium Concrete Mix",
  "sku": "CON-456",
  "category": "concrete",
  "description": "High-strength concrete mix",
  "unit": "bags",
  "unitPrice": 35.00,
  "taxRate": 0.15,
  "stockQuantity": 500,
  "reorderLevel": 50
}
```

**Update Product:**
```json
{
  "unitPrice": 37.50,
  "stockQuantity": 600
}
```

### Orders

**Create Order (with Customer ID):**
```json
{
  "customerId": "{{userId}}",
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 20
    }
  ],
  "deliveryAddress": {
    "line1": "789 Construction Ave",
    "line2": "Floor 3",
    "city": "Dammam",
    "notes": "Call before delivery"
  },
  "deliveryETA": "2025-12-20T14:00:00Z"
}
```

**Create Order (with Email):**
```json
{
  "customerEmail": "customer@csms.com",
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 15
    }
  ],
  "deliveryAddress": {
    "line1": "456 Builder Street",
    "city": "Riyadh",
    "notes": "Urgent delivery"
  },
  "deliveryETA": "2025-12-15T10:00:00Z"
}
```

**Update Order Status:**
```json
{
  "status": "Confirmed",
  "note": "Payment received, processing order"
}
```

---

## 🎨 Customization

### Adding Custom Tests

You can add custom tests to any request:

1. Select a request
2. Go to **Tests** tab
3. Add JavaScript test code:

```javascript
pm.test("Custom test name", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.someField).to.eql("expectedValue");
});
```

### Common Test Assertions

```javascript
// Status code
pm.response.to.have.status(200);

// Response time
pm.expect(pm.response.responseTime).to.be.below(1000);

// JSON structure
pm.expect(jsonData).to.have.property('fieldName');
pm.expect(jsonData.array).to.be.an('array');
pm.expect(jsonData.field).to.eql('value');

// Store variable
pm.collectionVariables.set("varName", value);

// Get variable
pm.collectionVariables.get("varName");
```

### Environment Variables

For multiple environments (dev, staging, production):

1. Create a new environment
2. Add variables:
   - `baseUrl`: Your API URL
   - `adminEmail`: Admin email for that environment
   - `adminPassword`: Admin password
3. Select environment from dropdown
4. Use `{{baseUrl}}` in requests

---

## 📈 Advanced Features

### Running Tests in CI/CD

Use Newman (Postman CLI) for automated testing:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run CSMS_Postman_Collection.json

# Run with environment
newman run CSMS_Postman_Collection.json -e environment.json

# Generate HTML report
newman run CSMS_Postman_Collection.json --reporters cli,html
```

### Exporting Test Results

1. Run collection
2. Click **Export Results** in runner
3. Choose format (JSON/HTML)
4. Save report

---

## 🔐 Security Notes

⚠️ **Important:**
- Never commit real credentials to version control
- Use environment variables for sensitive data
- The collection includes test credentials for development only
- Change default passwords in production
- Use HTTPS in production environments

---

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/docs)
- [Postman Test Scripts](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Newman CLI](https://github.com/postmanlabs/newman)
- [API Testing Best Practices](https://www.postman.com/api-platform/api-testing/)

---

## 🎯 Test Coverage Summary

| Endpoint Category | Requests | Tests |
|-------------------|----------|-------|
| Authentication | 6 | 18 |
| Products | 7 | 21 |
| Orders | 8 | 24 |
| Reports | 2 | 6 |
| **Total** | **23** | **69** |

---

## 💡 Tips & Best Practices

1. **Run in sequence** - Some requests depend on others (e.g., Create before Update)
2. **Check Console** - Use Console (bottom left) to debug variable issues
3. **Save responses** - Use "Save Response" feature to compare API changes
4. **Use folders** - Organize custom requests into folders
5. **Comment requests** - Add descriptions to document your test cases
6. **Export regularly** - Keep backups of your modified collection
7. **Use mock servers** - Test without a backend using Postman Mock Servers

---

## 🤝 Contributing

When adding new endpoints:
1. Add request to appropriate folder
2. Include automated tests
3. Add pre-request scripts if needed
4. Update this documentation
5. Export and commit updated collection

---

## ✅ Quick Checklist

Before reporting API issues:

- [ ] Dev server is running
- [ ] MongoDB is connected
- [ ] Database has seed data
- [ ] Logged in (userId variable is set)
- [ ] Products exist (productId variable is set)
- [ ] Using correct baseUrl
- [ ] All tests passing on main branch

---

**Happy Testing! 🚀**

For issues or questions, check the main API_TESTING.md file or review the test results in Postman.
