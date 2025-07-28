const request = require('supertest');
const app = require('../app');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Test data
let testUserId;
let testToken;
let testAddressId;

// Helper function to create a test user and get auth token
const createTestUser = async () => {
  testUserId = uuidv4();
  const phone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const name = `Test User ${Math.floor(Math.random() * 1000)}`;
  
  // Insert test user
  await query(
    'INSERT INTO customers (id, phone, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
    [testUserId, phone, name]
  );
  
  // Generate token (in a real app, this would come from your auth service)
  testToken = `test-token-${Date.now()}`;
  
  // Store token in database (simplified for testing)
  await query(
    'INSERT INTO customer_tokens (customer_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
    [testUserId, testToken]
  );
  
  return { userId: testUserId, token: testToken };
};

// Clean up test data
const cleanupTestData = async () => {
  if (testAddressId) {
    await query('DELETE FROM customer_addresses WHERE id = $1', [testAddressId]);
  }
  if (testUserId) {
    await query('DELETE FROM customer_tokens WHERE customer_id = $1', [testUserId]);
    await query('DELETE FROM customers WHERE id = $1', [testUserId]);
  }
};

describe('Address API Endpoints', () => {
  beforeAll(async () => {
    // Create a test user and get auth token
    await createTestUser();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('POST /api/customer/addresses', () => {
    it('should create a new address', async () => {
      const newAddress = {
        address_line1: '123 Test Street',
        address_line2: 'Apt 4B',
        landmark: 'Near Test Park',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        address_type: 'home',
        is_default: true
      };

      const response = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newAddress)
        .expect(201);

      // Save the address ID for subsequent tests
      testAddressId = response.body.id;

      expect(response.body).toMatchObject({
        address_line1: newAddress.address_line1,
        address_line2: newAddress.address_line2,
        landmark: newAddress.landmark,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        address_type: newAddress.address_type,
        is_default: newAddress.is_default,
        customer_id: testUserId
      });
    });

    it('should return 400 for invalid address data', async () => {
      const invalidAddress = {
        // Missing required fields
        city: 'Test City',
        state: 'Test State'
      };

      const response = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidAddress)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('GET /api/customer/addresses', () => {
    it('should retrieve all addresses for the authenticated customer', async () => {
      const response = await request(app)
        .get('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify the address we created is in the list
      const createdAddress = response.body.find(addr => addr.id === testAddressId);
      expect(createdAddress).toBeDefined();
    });
  });

  describe('GET /api/customer/addresses/:id', () => {
    it('should retrieve a specific address', async () => {
      const response = await request(app)
        .get(`/api/customer/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testAddressId);
      expect(response.body.customer_id).toBe(testUserId);
    });

    it('should return 404 for non-existent address', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/customer/addresses/${nonExistentId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);
    });

    it('should return 403 when trying to access another user\'s address', async () => {
      // Create another test user
      const otherUser = await createTestUser();
      
      // Try to access the first user's address with the second user's token
      await request(app)
        .get(`/api/customer/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .expect(403);
      
      // Clean up the second test user
      await query('DELETE FROM customer_tokens WHERE customer_id = $1', [otherUser.userId]);
      await query('DELETE FROM customers WHERE id = $1', [otherUser.userId]);
    });
  });

  describe('PUT /api/customer/addresses/:id', () => {
    it('should update an existing address', async () => {
      const updates = {
        address_line1: '456 Updated Street',
        landmark: 'Near Updated Park',
        is_default: false
      };

      const response = await request(app)
        .put(`/api/customer/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testAddressId,
        address_line1: updates.address_line1,
        landmark: updates.landmark,
        is_default: updates.is_default
      });
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdates = {
        pincode: 'invalid', // Invalid pincode format
        city: '' // Empty city
      };

      const response = await request(app)
        .put(`/api/customer/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidUpdates)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('PUT /api/customer/addresses/:id/set-default', () => {
    it('should set an address as default', async () => {
      // First, create a second address
      const secondAddress = {
        address_line1: '789 Another Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '654321',
        address_type: 'work',
        is_default: false
      };

      const createResponse = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`)
        .send(secondAddress);
      
      const secondAddressId = createResponse.body.id;

      // Set the second address as default
      await request(app)
        .put(`/api/customer/addresses/${secondAddressId}/set-default`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Verify that only the second address is now default
      const getResponse = await request(app)
        .get('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`);
      
      const addresses = getResponse.body;
      const defaultAddresses = addresses.filter(addr => addr.is_default);
      
      expect(defaultAddresses.length).toBe(1);
      expect(defaultAddresses[0].id).toBe(secondAddressId);

      // Clean up the second address
      await query('DELETE FROM customer_addresses WHERE id = $1', [secondAddressId]);
    });
  });

  describe('DELETE /api/customer/addresses/:id', () => {
    it('should delete an address', async () => {
      // First, create a new address to delete
      const addressToDelete = {
        address_line1: '999 Delete Me',
        city: 'Test City',
        state: 'Test State',
        pincode: '987654',
        address_type: 'other',
        is_default: false
      };

      const createResponse = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${testToken}`)
        .send(addressToDelete);
      
      const addressIdToDelete = createResponse.body.id;

      // Delete the address
      await request(app)
        .delete(`/api/customer/addresses/${addressIdToDelete}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(204);

      // Verify the address was deleted
      const getResponse = await request(app)
        .get(`/api/customer/addresses/${addressIdToDelete}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);
    });

    it('should not allow deleting the default address if it\'s the only one', async () => {
      // First, make sure our test address is the only one
      await query('DELETE FROM customer_addresses WHERE id != $1', [testAddressId]);
      
      // Set it as default
      await query(
        'UPDATE customer_addresses SET is_default = true WHERE id = $1',
        [testAddressId]
      );

      // Try to delete the default address (should fail)
      const response = await request(app)
        .delete(`/api/customer/addresses/${testAddressId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Cannot delete the default address');
    });
  });
});
