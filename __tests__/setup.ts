/**
 * Jest Setup for I-MELT Testing Suite
 * Phase 5: CI test configuration
 */

// Mock WebSocket for client-side tests
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  send: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock localStorage for client-side tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock fetch for API tests
global.fetch = jest.fn();

// Silence console.log in tests unless VERBOSE=true
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DEMO_RANDOM = 'false'; // Deterministic for tests