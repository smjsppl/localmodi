# LocalModi API Design

## Overview
RESTful API for the LocalModi hyperlocal ordering platform. Supports geolocation-based vendor matching, RFQ system, and real-time order management.

## Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.localmodi.com/v1
```

## Authentication
- **Customer**: Optional OTP-based authentication (future scope)
- **Vendor**: Required OTP-based authentication with invite-only access
- **Headers**: `Authorization: Bearer <token>`

## Core API Endpoints

### 1. Authentication

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone_number": "+919876543210",
  "user_type": "vendor" // or "customer"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone_number": "+919876543210",
  "otp_code": "123456",
  "user_type": "vendor"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "phone_number": "+919876543210",
    "user_type": "vendor",
    "profile": { ... }
  }
}
```

### 2. Categories

#### Get Categories
```http
GET /categories

Response:
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "beverages",
      "display_name": "Beverages",
      "icon": "coffee",
      "color": "blue"
    }
  ]
}
```

### 3. RFQ Management

#### Create RFQ
```http
POST /rfqs
Content-Type: application/json

{
  "customer_location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "Koramangala, Bangalore"
  },
  "items": [
    {
      "category_id": "uuid",
      "raw_input": "Thums Up 500ml 2 bottles",
      "parsed_data": {
        "brand": "Thums Up",
        "quantity": "500ml",
        "unit": "bottle",
        "count": 2
      }
    }
  ]
}

Response:
{
  "success": true,
  "rfq": {
    "id": "uuid",
    "status": "sent",
    "total_items": 1,
    "expires_at": "2024-01-01T10:00:00Z",
    "nearby_vendors": 5
  }
}
```

#### Get RFQ Status
```http
GET /rfqs/{rfq_id}

Response:
{
  "success": true,
  "rfq": {
    "id": "uuid",
    "status": "sent",
    "items": [...],
    "responses": [
      {
        "vendor_id": "uuid",
        "vendor_name": "Local Store",
        "total_amount": 120.00,
        "delivery_time_minutes": 15,
        "status": "submitted"
      }
    ]
  }
}
```

### 4. Vendor Operations

#### Get Pending RFQs (Vendor)
```http
GET /vendor/rfqs/pending
Authorization: Bearer <vendor_token>

Response:
{
  "success": true,
  "rfqs": [
    {
      "id": "uuid",
      "customer_distance_km": 0.5,
      "items": [...],
      "created_at": "2024-01-01T09:00:00Z",
      "expires_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Submit RFQ Response (Vendor)
```http
POST /vendor/rfqs/{rfq_id}/respond
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "total_amount": 120.00,
  "delivery_time_minutes": 15,
  "delivery_fee": 10.00,
  "item_quotes": [
    {
      "rfq_item_id": "uuid",
      "unit_price": 60.00,
      "available_quantity": 10,
      "brand_offered": "Thums Up",
      "notes": "Fresh stock available"
    }
  ],
  "notes": "Can deliver within 15 minutes"
}

Response:
{
  "success": true,
  "response": {
    "id": "uuid",
    "status": "submitted",
    "expires_at": "2024-01-01T11:00:00Z"
  }
}
```

### 5. Order Management

#### Accept Vendor Quote (Customer)
```http
POST /rfqs/{rfq_id}/accept
Content-Type: application/json

{
  "response_id": "uuid",
  "delivery_address": "Full delivery address",
  "delivery_instructions": "Ring the bell twice",
  "payment_method": "cod"
}

Response:
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "LM001234",
    "status": "confirmed",
    "total_amount": 120.00,
    "estimated_delivery_at": "2024-01-01T09:30:00Z"
  }
}
```

#### Update Order Status (Vendor)
```http
PATCH /orders/{order_id}/status
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "status": "preparing", // preparing, ready, dispatched, delivered
  "notes": "Order is being prepared"
}

Response:
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "preparing",
    "updated_at": "2024-01-01T09:15:00Z"
  }
}
```

### 6. LLM Integration

#### Parse Order Text
```http
POST /llm/parse-order
Content-Type: application/json

{
  "text": "I want 2 bottles of Thums Up 500ml and 1 packet of Lays chips",
  "category": "beverages"
}

Response:
{
  "success": true,
  "parsed_items": [
    {
      "brand": "Thums Up",
      "quantity": "500ml",
      "unit": "bottle",
      "count": 2,
      "confidence": 0.95,
      "category_match": true
    }
  ],
  "filtered_items": [
    // Only items matching the selected category
  ]
}
```

### 7. Geolocation Services

#### Find Nearby Vendors
```http
GET /vendors/nearby?lat=12.9716&lng=77.5946&radius=5&category=beverages

Response:
{
  "success": true,
  "vendors": [
    {
      "id": "uuid",
      "business_name": "Local Mart",
      "distance_km": 0.5,
      "rating": 4.2,
      "average_response_time": 12,
      "categories": ["beverages", "snacks"]
    }
  ]
}
```

## WebSocket Events (Real-time Updates)

### Customer Events
- `rfq_response_received` - New vendor quote
- `order_status_updated` - Order status change
- `delivery_update` - Delivery tracking

### Vendor Events  
- `new_rfq` - New RFQ in vendor's area
- `rfq_expired` - RFQ expired
- `order_confirmed` - Customer accepted quote

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone_number",
      "value": "invalid_value"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VENDOR_NOT_INVITED` - Vendor not in invite list
- `RFQ_EXPIRED` - RFQ has expired
- `GEOLOCATION_ERROR` - Location services unavailable

## Rate Limiting
- **General API**: 100 requests per minute per IP
- **OTP endpoints**: 5 requests per minute per phone number
- **Vendor RFQ responses**: 50 requests per minute per vendor

## Data Models

### RFQ Item Structure
```json
{
  "id": "uuid",
  "category_id": "uuid",
  "raw_input": "Original customer input",
  "parsed_brand": "Brand Name",
  "parsed_quantity": "500ml",
  "parsed_unit": "bottle",
  "parsed_count": 2,
  "llm_confidence": 0.95,
  "notes": "Additional notes"
}
```

### Vendor Response Structure
```json
{
  "id": "uuid",
  "vendor": {
    "id": "uuid",
    "business_name": "Local Store",
    "rating": 4.2,
    "distance_km": 0.5
  },
  "total_amount": 120.00,
  "delivery_time_minutes": 15,
  "delivery_fee": 10.00,
  "status": "submitted",
  "expires_at": "2024-01-01T11:00:00Z"
}
```

## Implementation Priority

### Phase 1 (MVP)
1. Authentication (OTP for vendors)
2. Category management
3. RFQ creation and management
4. Basic vendor response system
5. Geolocation-based vendor matching

### Phase 2 (Enhanced)
1. Order management and tracking
2. Real-time WebSocket updates
3. LLM integration for text parsing
4. Rating and review system

### Phase 3 (Advanced)
1. Customer OTP authentication
2. Payment integration
3. Delivery tracking
4. Analytics and reporting
