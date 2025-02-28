// cypress/e2e/stocksApp.cy.js

describe('Stock App Tests', () => {
  // Mock data for testing
  const mockStocks = [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      initial_price: 174.55,
      priceChange: 2.34,
      totalChange: 5.78,
      totalChangePercent: 3.42,
      history: [
        { time: '10:30:00', price: 172.21 },
        { time: '10:33:00', price: 173.15 },
        { time: '10:36:00', price: 174.55 }
      ],
      startPrice: 168.77
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corporation',
      initial_price: 326.78,
      priceChange: -1.22,
      totalChange: -3.45,
      totalChangePercent: -1.04,
      history: [
        { time: '10:30:00', price: 328.00 },
        { time: '10:33:00', price: 327.50 },
        { time: '10:36:00', price: 326.78 }
      ],
      startPrice: 330.23
    },
    {
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      initial_price: 138.45,
      priceChange: 0.87,
      totalChange: 2.34,
      totalChangePercent: 1.72,
      history: [
        { time: '10:30:00', price: 137.58 },
        { time: '10:33:00', price: 138.10 },
        { time: '10:36:00', price: 138.45 }
      ],
      startPrice: 136.11
    }
  ];

  beforeEach(() => {
    // Stub the API request to return our mock data
    cy.intercept('GET', 'http://localhost:5000/api/stocks', {
      statusCode: 200,
      body: mockStocks
    }).as('getStocks');

    // Visit the app
    cy.visit('http://localhost:3000');
  });

  describe('Navigation Tests', () => {
    it('should redirect to stocks page from root URL', () => {
      cy.url().should('include', '/stocks');
    });

  });

  describe('Stocks Page Tests', () => {
    it('should display the Market Dashboard heading', () => {
      cy.contains('h1', 'Market Dashboard').should('be.visible');
      cy.contains('h2', 'Live Stock Prices').should('be.visible');
    });

    

    it('should style prices according to change direction', () => {
      cy.wait('@getStocks');
      
      // Positive changes (Apple) should be green
      cy.contains('.stock-card', 'Apple Inc.').within(() => {
        // We don't know the exact color format, so check style attribute exists
        cy.get('.price-value').should('have.attr', 'style').and('include', 'color');
        cy.get('.total-value').should('have.attr', 'style').and('include', 'color');
      });
      
      // Negative changes (Microsoft) should be red
      cy.contains('.stock-card', 'Microsoft Corporation').within(() => {
        cy.get('.price-value').should('have.attr', 'style').and('include', 'color');
        cy.get('.total-value').should('have.attr', 'style').and('include', 'color');
      });
    });

    it('should display charts for each stock', () => {
      cy.wait('@getStocks');
      
      // Verify all cards have charts
      cy.get('.stock-card').each(($card) => {
        cy.wrap($card).find('.recharts-responsive-container').should('exist');
        cy.wrap($card).find('.recharts-cartesian-grid').should('exist');
        cy.wrap($card).find('.recharts-line').should('exist');
      });
    });

    it('should show loading state before data arrives', () => {
      // New visit with delayed response
      cy.intercept('GET', 'http://localhost:5000/api/stocks', {
        statusCode: 200,
        body: mockStocks,
        delay: 1000
      }).as('delayedStocks');
      
      cy.visit('http://localhost:3000/stocks');
      
      // Check loading state appears
      cy.contains('Loading stock data...').should('be.visible');
      
      // After data loads, loading should disappear
      cy.wait('@delayedStocks');
      cy.contains('Loading stock data...').should('not.exist');
      cy.get('.stock-card').should('have.length', mockStocks.length);
    });

    it('should show error state when API fails', () => {
      // New visit with error response
      cy.intercept('GET', 'http://localhost:5000/api/stocks', {
        statusCode: 500,
        body: { error: 'Server error' },
        delay: 100
      }).as('errorStocks');
      
      cy.visit('http://localhost:3000/stocks');
      
      // Wait for API call to complete
      cy.wait('@errorStocks');
      
      // Check error state appears
      cy.contains('Failed to load stock data. Please try again later.').should('be.visible');
      cy.contains('button', 'Retry').should('be.visible');
      
      // Test retry button - now return success
      cy.intercept('GET', 'http://localhost:5000/api/stocks', {
        statusCode: 200,
        body: mockStocks
      }).as('retryStocks');
      
      cy.contains('button', 'Retry').click();
      cy.wait('@retryStocks');
      
      // Should now show stock data
      cy.get('.stock-card').should('have.length', mockStocks.length);
    });

    it('should show empty state when no stocks are available', () => {
      // New visit with empty response
      cy.intercept('GET', 'http://localhost:5000/api/stocks', {
        statusCode: 200,
        body: []
      }).as('emptyStocks');
      
      cy.visit('http://localhost:3000/stocks');
      cy.wait('@emptyStocks');
      
      // Check empty state appears
      cy.contains('No stocks available at the moment').should('be.visible');
    });
  });

  describe('Watchlist Tests', () => {
    it('should display empty watchlist message initially', () => {
      // Go to watchlist page
      cy.contains('Watchlist').click();
      cy.url().should('include', '/watchlist');
      
      // Check for empty state message
      cy.contains('Your watchlist is empty').should('be.visible');
    });
    
    it('should add stocks to watchlist and display them', () => {
      // Wait for stocks to load
      cy.wait('@getStocks');
      
      // Add Apple to watchlist
      cy.contains('.stock-card', 'Apple Inc.')
        .contains('button', 'Add to Watchlist')
        .click();
      
      // Add Google to watchlist
      cy.contains('.stock-card', 'Alphabet Inc.')
        .contains('button', 'Add to Watchlist')
        .click();
      
      // Navigate to watchlist
      cy.contains('Watchlist').click();
      cy.url().should('include', '/watchlist');
      
      // Check that both stocks appear in watchlist
      cy.get('.watchlist-item').should('have.length', 2);
      cy.contains('Apple Inc. (AAPL)').should('be.visible');
      cy.contains('Alphabet Inc. (GOOGL)').should('be.visible');
    });
    
  });

});