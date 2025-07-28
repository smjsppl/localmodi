# LocalModi Phase 2: User Experience & Vendor Flow Setup

Complete database-driven vendor and customer experience with RFQ system.

## 🎯 **Phase 2 Overview**

Phase 2 focuses on the complete business workflow:
- **Customer Flow**: Order → RFQ → Review Quotes → Accept → Order Confirmation
- **Vendor Flow**: OTP Login → View RFQs → Submit Quotes → Order Management
- **Database Operations**: Full CRUD for all user interactions
- **Authentication**: JWT-based auth with OTP for vendors

## 🗄️ **Database Setup**

### **1. Install PostgreSQL**
```bash
# Download and install PostgreSQL from https://www.postgresql.org/download/
# Or use Docker:
docker run --name localmodi-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### **2. Create Database**
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE localmodi;
CREATE USER localmodi_user WITH PASSWORD 'localmodi_pass';
GRANT ALL PRIVILEGES ON DATABASE localmodi TO localmodi_user;
```

### **3. Run Database Schema**
```bash
# Execute the schema file:
psql -U postgres -d localmodi -f m:\localmodi\database\schema.sql
```

## ⚙️ **Backend Setup**

### **1. Environment Configuration**
```bash
cd m:\localmodi\backend
cp .env.example .env
```

Edit `.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=localmodi
DB_USER=postgres
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Server Configuration
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### **2. Install Dependencies & Start**
```bash
npm install
npm run dev  # Server runs on http://localhost:8000
```

## 🧪 **API Testing**

### **Authentication Endpoints**

#### **Customer Login (Simplified)**
```bash
curl -X POST http://localhost:8000/api/v1/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210", "name": "John Doe"}'
```

#### **Vendor Login (OTP-based)**
```bash
# Step 1: Request OTP
curl -X POST http://localhost:8000/api/v1/auth/vendor/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543211"}'

# Step 2: Verify OTP (use OTP from logs in development)
curl -X POST http://localhost:8000/api/v1/auth/vendor/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543211", "otp": "123456"}'
```

### **RFQ Endpoints**

#### **Create RFQ (Customer)**
```bash
curl -X POST http://localhost:8000/api/v1/rfq/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -d '{
    "category": "beverages",
    "items": [
      {"item": "Limca", "brand": "Limca", "unit": "500ml", "qty": 3},
      {"item": "Thums Up", "brand": "Thums Up", "unit": "1L", "qty": 2}
    ],
    "location": {
      "lat": 12.9716,
      "lng": 77.5946,
      "address": "Bangalore, Karnataka"
    }
  }'
```

#### **Get Vendor RFQs**
```bash
curl -X GET http://localhost:8000/api/v1/rfq/vendor/my-rfqs \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

#### **Submit Quote (Vendor)**
```bash
curl -X POST http://localhost:8000/api/v1/rfq/vendor/RFQ_ID/submit-quote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -d '{
    "total_price": 150.00,
    "notes": "Fresh items available. Can deliver in 30 minutes."
  }'
```

## 📊 **Mock Data Setup**

Let me create a script to populate the database with test data:

### **Sample Users**
- **Customer**: +919876543210 (John Doe)
- **Vendor**: +919876543211 (Fresh Mart) - Categories: beverages, snacks
- **Vendor**: +919876543212 (Quick Store) - Categories: groceries, beverages

### **Sample Locations**
- **Bangalore**: 12.9716, 77.5946
- **Delhi**: 28.7041, 77.1025
- **Mumbai**: 19.0760, 72.8777

## 🎨 **Frontend Integration**

### **Customer Flow Components**
1. **Login**: Simple phone number entry
2. **Order Creation**: Category → Items → Location → Submit
3. **RFQ Dashboard**: View submitted RFQs and quotes
4. **Quote Comparison**: Compare vendor quotes and accept

### **Vendor Flow Components**
1. **OTP Login**: Phone → OTP → Dashboard
2. **RFQ List**: View available RFQs in vendor's area
3. **Quote Submission**: Review RFQ → Submit price quote
4. **Order Management**: Track accepted orders

## 🔄 **Complete User Journey**

### **Customer Journey**
```
1. Login with phone number ✅
2. Select category (beverages) ✅
3. Add items via text/voice/image (mock data) ✅
4. Review parsed items in grid ✅
5. Add location and submit RFQ ✅
6. View submitted RFQs ✅
7. Compare vendor quotes ✅
8. Accept best quote ✅
9. Order confirmation ✅
```

### **Vendor Journey**
```
1. Login with OTP ✅
2. View available RFQs in area ✅
3. Review RFQ details and items ✅
4. Submit competitive quote ✅
5. Get notified of acceptance ✅
6. Manage order fulfillment ✅
```

## 🚀 **Next Steps**

1. **Setup Database**: Create PostgreSQL database and run schema
2. **Configure Environment**: Set up .env with database credentials
3. **Test APIs**: Use provided curl commands to test all endpoints
4. **Frontend Integration**: Connect React components to backend APIs
5. **Mock Data**: Populate database with test vendors and locations

## 🐛 **Troubleshooting**

### **Database Connection Issues**
```bash
# Test database connection
psql -U postgres -d localmodi -c "SELECT NOW();"
```

### **Authentication Issues**
- Check JWT_SECRET in .env
- Verify token format: "Bearer TOKEN"
- Check token expiry

### **RFQ Creation Issues**
- Verify customer authentication
- Check location coordinates format
- Ensure items array is not empty

---

**Ready to test the complete vendor-customer flow!** 🎯

The system now supports:
✅ **Authentication** - Customer & Vendor login  
✅ **RFQ Management** - Create, view, quote, accept  
✅ **Database Operations** - Full CRUD operations  
✅ **Location-based Matching** - Find nearby vendors  
✅ **Order Lifecycle** - From RFQ to order confirmation  

Start with database setup, then test the APIs! 🚀
