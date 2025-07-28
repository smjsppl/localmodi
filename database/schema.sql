-- LocalModi Database Schema
-- Hyperlocal vendor-customer ordering platform

-- Users table (both customers and vendors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    user_type ENUM('customer', 'vendor') NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer profiles
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferred_name VARCHAR(50),
    delivery_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vendor profiles
CREATE TABLE vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(100) NOT NULL,
    business_type VARCHAR(50), -- grocery, pharmacy, restaurant, etc.
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_invite_only BOOLEAN DEFAULT true,
    average_response_time INTEGER, -- in minutes
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations (for geospatial queries)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    location_type ENUM('home', 'work', 'business', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Geospatial index for nearby vendor queries
    INDEX idx_location_coords (latitude, longitude)
);

-- Categories (beverages, snacks, groceries, etc.)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor categories (which categories each vendor serves)
CREATE TABLE vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_vendor_category (vendor_id, category_id)
);

-- RFQs (Request for Quotations) - core of the platform
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_location_id UUID REFERENCES locations(id),
    status ENUM('draft', 'sent', 'expired', 'cancelled') DEFAULT 'draft',
    total_items INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rfq_status (status),
    INDEX idx_rfq_created (created_at)
);

-- RFQ Items (items within each RFQ, organized by category)
CREATE TABLE rfq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    raw_input TEXT NOT NULL, -- original customer input
    parsed_brand VARCHAR(100),
    parsed_quantity VARCHAR(50),
    parsed_unit VARCHAR(20),
    parsed_count INTEGER DEFAULT 1,
    llm_confidence DECIMAL(3,2), -- confidence score from LLM parsing
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor RFQ responses (quotes)
CREATE TABLE rfq_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status ENUM('pending', 'submitted', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    delivery_time_minutes INTEGER,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    expires_at TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_response_status (status),
    INDEX idx_response_rfq (rfq_id)
);

-- Individual item quotes within vendor responses
CREATE TABLE rfq_item_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES rfq_responses(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(8,2) NOT NULL,
    available_quantity INTEGER,
    brand_offered VARCHAR(100),
    notes TEXT,
    item_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders (when customer accepts a vendor's quote)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID REFERENCES rfqs(id),
    response_id UUID REFERENCES rfq_responses(id),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled') DEFAULT 'confirmed',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    payment_method ENUM('cod', 'digital', 'upi') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    delivery_address TEXT,
    delivery_instructions TEXT,
    estimated_delivery_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order_status (status),
    INDEX idx_order_customer (customer_id),
    INDEX idx_order_vendor (vendor_id)
);

-- Order items (final confirmed items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES rfq_items(id),
    item_quote_id UUID REFERENCES rfq_item_quotes(id),
    brand VARCHAR(100),
    quantity VARCHAR(50),
    unit VARCHAR(20),
    count INTEGER,
    unit_price DECIMAL(8,2),
    total_price DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor invite list (for invite-only onboarding)
CREATE TABLE vendor_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    invited_by UUID REFERENCES users(id),
    business_name VARCHAR(100),
    business_type VARCHAR(50),
    status ENUM('pending', 'registered', 'expired') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    INDEX idx_invite_phone (phone_number),
    INDEX idx_invite_status (status)
);

-- OTP verification
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    user_type ENUM('customer', 'vendor') NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_otp_phone (phone_number),
    INDEX idx_otp_expires (expires_at)
);

-- Ratings and reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_review_vendor (vendor_id),
    INDEX idx_review_rating (rating)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'new_rfq', 'quote_received', 'order_update', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- additional structured data
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at)
);

-- System settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, display_name, icon, color, sort_order) VALUES
('beverages', 'Beverages', 'coffee', 'blue', 1),
('snacks', 'Snacks', 'cookie', 'orange', 2),
('fruits', 'Fruits & Vegetables', 'apple', 'green', 3),
('groceries', 'Groceries', 'shopping-cart', 'purple', 4),
('food', 'Ready to Eat', 'utensils', 'red', 5),
('health', 'Health & Beauty', 'heart', 'pink', 6),
('household', 'Household Items', 'home', 'indigo', 7),
('automotive', 'Automotive', 'car', 'gray', 8);

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('rfq_expiry_minutes', '60', 'Default RFQ expiry time in minutes'),
('max_vendor_distance_km', '5', 'Maximum distance to search for vendors'),
('min_order_amount', '50', 'Minimum order amount in rupees'),
('delivery_fee_threshold', '200', 'Free delivery above this amount');
