/**
 * Jest Test Setup
 * Global test configuration and mocks for Pleading Sanity
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock fetch API
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
global.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock service worker
global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve()),
  getRegistration: jest.fn(() => Promise.resolve()),
  ready: Promise.resolve()
};

// Mock Notification API
global.Notification = {
  permission: 'default',
  requestPermission: jest.fn(() => Promise.resolve('granted'))
};

// Mock geolocation
global.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Mock console methods for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Global test utilities
global.testUtils = {
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for animations
  waitForAnimation: (duration = 1000) => new Promise(resolve => setTimeout(resolve, duration)),
  
  // Mock ChatGPT response
  mockChatGPTResponse: (message = 'Hello! How can I help you today?') => ({
    choices: [{
      message: {
        content: message,
        role: 'assistant'
      }
    }]
  }),
  
  // Mock user interaction
  mockUserEvent: (type, target, options = {}) => {
    const event = new Event(type, { bubbles: true, ...options });
    if (target) {
      target.dispatchEvent(event);
    }
    return event;
  },
  
  // Create mock DOM elements
  createElement: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    children.forEach(child => {
      if (typeof child === 'string') {
        element.textContent = child;
      } else {
        element.appendChild(child);
      }
    });
    return element;
  }
};

// Pleading Sanity specific test data
global.testData = {
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@pleadingsanity.co.uk'
  },
  
  journalEntry: {
    id: 'journal-123',
    content: 'Today was a good day for my mental health.',
    timestamp: '2024-01-01T12:00:00Z',
    mood: 'positive'
  },
  
  chatMessages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'I\'m feeling anxious today.',
      timestamp: '2024-01-01T12:00:00Z'
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: 'I understand you\'re feeling anxious. Let\'s work through this together.',
      timestamp: '2024-01-01T12:01:00Z'
    }
  ],
  
  product: {
    id: 'prod-123',
    name: 'Crying Brain Hoodie',
    price: 59.99,
    currency: 'GBP',
    size: 'M',
    color: 'Black'
  }
};