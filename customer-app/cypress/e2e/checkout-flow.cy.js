/// <reference types="cypress" />

describe('Checkout Flow with Address Management', () => {
  // Test data
  const testUser = {
    phone: `+91${Math.floor(9000000000 + Math.random() * 1000000000)}`,
    name: `Test User ${Math.floor(Math.random() * 1000)}`,
    pincode: '110001', // Valid Indian pincode
    city: 'New Delhi',
    state: 'Delhi'
  };

  const testAddress1 = {
    address_line1: '123 Test Street',
    address_line2: 'Apt 4B',
    landmark: 'Near Test Park',
    pincode: '110001',
    city: 'New Delhi',
    state: 'Delhi',
    address_type: 'home',
    is_default: true
  };

  const testAddress2 = {
    address_line1: '456 Work Avenue',
    address_line2: 'Office 101',
    landmark: 'Near Business Center',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    address_type: 'work',
    is_default: false
  };

  before(() => {
    // Clear any existing session data
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Register and log in the test user
    cy.request('POST', 'http://localhost:8000/api/v1/auth/register', {
      phone: testUser.phone,
      name: testUser.name,
      pincode: testUser.pincode
    }).then((response) => {
      // Store the token for authenticated requests
      const token = response.body.token;
      cy.setLocalStorage('token', token);
      cy.setLocalStorage('user', JSON.stringify(response.body.user));
      
      // Add test addresses via API
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/v1/customer/addresses',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: testAddress1
      });
      
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/api/v1/customer/addresses',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: testAddress2
      });
    });
  });

  beforeEach(() => {
    // Preserve auth token between tests
    Cypress.Cookies.preserveOnce('session_id', 'remember_token');
  });

  it('should allow a user to select an address during checkout', () => {
    // Visit the app with the authenticated session
    cy.visit('/', {
      onBeforeLoad(win) {
        // Set the auth token in localStorage before the app loads
        const token = window.localStorage.getItem('token');
        if (token) {
          win.localStorage.setItem('token', token);
        }
      }
    });

    // Verify user is logged in
    cy.get('header').should('contain', testUser.name);

    // Navigate to a product category
    cy.get('a').contains('Categories').click();
    cy.get('a').contains('Test Category').first().click();
    
    // Add a product to cart
    cy.get('button').contains('Add to Cart').first().click();
    
    // Proceed to checkout
    cy.get('button').contains('Proceed to Checkout').click();
    
    // Verify the default address is shown
    cy.contains(testAddress1.address_line1).should('be.visible');
    cy.contains('Default').should('be.visible');
    
    // Click to change address
    cy.get('button').contains('Change').click();
    
    // Verify address selection modal appears
    cy.get('h3').contains('Select a delivery address').should('be.visible');
    
    // Select the second address
    cy.contains(testAddress2.address_line1).click();
    
    // Click 'Deliver to this address' button
    cy.get('button').contains('Deliver to this address').click();
    
    // Verify the selected address is now displayed
    cy.contains(testAddress2.address_line1).should('be.visible');
    cy.contains(testAddress2.city).should('be.visible');
    cy.contains(testAddress2.pincode).should('be.visible');
    
    // Continue with the rest of the checkout flow
    // (This would be expanded with payment and order confirmation tests)
    cy.get('button').contains('Continue to Payment').should('be.visible');
  });

  it('should allow adding a new address during checkout', () => {
    // Start checkout flow
    cy.visit('/categories');
    cy.get('a').contains('Test Category').first().click();
    cy.get('button').contains('Add to Cart').first().click();
    cy.get('button').contains('Proceed to Checkout').click();
    
    // Open address selection
    cy.get('button').contains('Change').click();
    
    // Click 'Add New Address'
    cy.get('button').contains('Add New Address').click();
    
    // Fill out the address form
    const newAddress = {
      address_line1: '789 New Street',
      address_line2: 'Floor 5',
      landmark: 'Near New Landmark',
      pincode: '560001',
      city: 'Bangalore',
      state: 'Karnataka',
      address_type: 'other'
    };
    
    cy.get('input[name="address_line1"]').type(newAddress.address_line1);
    cy.get('input[name="address_line2"]').type(newAddress.address_line2);
    cy.get('input[name="landmark"]').type(newAddress.landmark);
    cy.get('input[name="pincode"]').type(newAddress.pincode);
    
    // Note: In a real test, we would need to mock the pincode API response
    // For now, we'll just type the city and state directly
    cy.get('input[name="city"]').clear().type(newAddress.city);
    cy.get('input[name="state"]').clear().type(newAddress.state);
    
    // Select address type
    cy.get('input[value="other"]').check();
    
    // Save the address
    cy.get('button').contains('Add Address').click();
    
    // Verify the new address is selected
    cy.contains(newAddress.address_line1).should('be.visible');
    cy.contains(newAddress.city).should('be.visible');
    cy.contains(newAddress.pincode).should('be.visible');
  });

  after(() => {
    // Clean up test data
    const token = window.localStorage.getItem('token');
    if (token) {
      // In a real app, you would delete the test user and their addresses
      // This would typically be done via an API call to a test cleanup endpoint
      cy.log('Test complete - clean up test data');
    }
  });
});
