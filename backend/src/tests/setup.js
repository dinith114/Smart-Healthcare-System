// Test setup and global mocks
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

