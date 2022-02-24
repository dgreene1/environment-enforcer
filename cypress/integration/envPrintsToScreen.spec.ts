/// <reference types="cypress" />

describe('create react App test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('finds the value of the env var on the page', () => {
    cy.get('[data-test-id]=test-1').should(
      'have.text',
      'value for development environment'
    );
  });
});
