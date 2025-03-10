/// <reference types="cypress" />

describe('Testing log out', () => {
  

  beforeEach('Login to application', () => {
    cy.loginToApplication();
  });

  it('Verify user can log out successfully', {retries: 2}, () => {
    cy.contains('Settings').click();
    cy.contains('Or click here to logout').click();
    cy.get('.navbar-nav').should('contain', 'Sign up1');
  })

});


