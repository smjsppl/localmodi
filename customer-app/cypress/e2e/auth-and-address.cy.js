/// <reference types="cypress" />

describe('Authentication and Address Management', () => {
  // Test user credentials
  const testUser = {
    phone: `+91${Math.floor(9000000000 + Math.random() * 1000000000)}`,
    name: `Test User ${Math.floor(Math.random() * 1000)}`,
    pincode: '110001', // Valid Indian pincode
    city: 'New Delhi',
    state: 'Delhi'
  };

  const testAddress = {
    address_line1: '123 Test Street',
    address_line2: 'Apt 4B',
    landmark: 'Near Test Park',
    pincode: '110001',
    city: 'New Delhi',
    state: 'Delhi',
    address_type: 'home',
    is_default: true
  };

  before(() => {
    // Clear any existing session data
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow a user to register, log in, add an address, and use it in checkout', () => {
    // 1. Visit the home page
    cy.visit('/');

    // 2. Navigate to registration
    cy.get('button').contains('Login / Sign Up').click();
    cy.get('a').contains("Don't have an account? Register").click();

    // 3. Fill out the registration form
    cy.get('input[placeholder="Enter your mobile number"]').type(testUser.phone);
    cy.get('input[placeholder="Enter your full name"]').type(testUser.name);
    cy.get('input[placeholder="Enter 6-digit PIN code"]').type(testUser.pincode);
    
    // 4. Submit the form
    cy.get('button').contains('Register').click();

    // 5. Verify successful registration and automatic login
    cy.get('header').should('contain', testUser.name);

    // 6. Navigate to address book
    cy.get('header').find('button').contains(testUser.name.split(' ')[0]).click();
    cy.get('a').contains('My Addresses').click();

    // 7. Add a new address
    cy.get('button').contains('Add New Address').click();
    
    // 8. Fill out the address form
    cy.get('input[name="address_line1"]').type(testAddress.address_line1);
    cy.get('input[name="address_line2"]').type(testAddress.address_line2);
    cy.get('input[name="landmark"]').type(testAddress.landmark);
    cy.get('input[name="pincode"]').type(testAddress.pincode);
    
    // City and state should be auto-filled by the pincode API
    cy.get('input[name="city"]').should('have.value', testAddress.city);
    cy.get('input[name="state"]').should('have.value', testAddress.state);
    
    // Select address type and set as default
    cy.get('input[value="home"]').check();
    cy.get('input[name="is_default"]').check();
    
    // 9. Save the address
    cy.get('button').contains('Add Address').click();
    
    // 10. Verify the address was added
    cy.contains(testAddress.address_line1).should('be.visible');
    cy.contains('Default').should('be.visible');

    // 11. Navigate to a product category (assuming there's a test category)
    cy.visit('/categories');
    cy.get('a').contains('Test Category').first().click();
    
    // 12. Add a product to cart
    cy.get('button').contains('Add to Cart').first().click();
    
    // 13. Proceed to checkout
    cy.get('button').contains('Proceed to Checkout').click();
    
    // 14. Verify the address is pre-selected in checkout
    cy.contains('Deliver to this address').should('be.visible');
    cy.get('button').contains('Deliver to this address').click();
    
    // 15. Verify we're on the payment page with the correct address
    cy.url().should('include', '/payment');
    cy.contains(testAddress.address_line1).should('be.visible');
  });

  after(() => {
    // Clean up: Log out and clear test data
    cy.get('header').find('button').contains(testUser.name.split(' ')[0]).click();
    cy.get('button').contains('Sign out').click();
    
    // In a real app, you would also clean up the test user from the database
    // This would typically be done via an API call to a test cleanup endpoint
  });
});
