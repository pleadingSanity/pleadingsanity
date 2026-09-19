// ==============================================================
// PLEADING SANITY — JEST TEST CONFIGURATION
// Optimized · Fast · CI-Ready · Complete Coverage
// Version: 2.0-BUFFED | Updated: 2026-09-19
// ==============================================================

module.exports = {
  // Test environment — browser-like DOM for our frontend
  testEnvironment: 'jsdom',

  // Setup to run AFTER test framework is loaded
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Which files are tests
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Exclude from testing
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.netlify/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // ─── PERFORMANCE OPTIMIZATIONS ───
  cache: true,
  cacheDirectory: '<rootDir>/.cache/jest',
  maxWorkers: '50%', // Balance speed + memory — CI-safe

  // ─── COVERAGE REPORTING ───
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!dist/**',
    '!build/**',
    '!.cache/**',
    '!scripts/**',
    '!tests/**',
    '!netlify/functions/**',
    '!**/*.config.js'
  ],

  // ─── PATH ALIASES — matches our import structure ───
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass|svg|png|jpg|gif)$': 'identity-obj-proxy'
  },

  // ─── TRANSFORMATION — Babel for modern JS ───
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      cacheDirectory: '<rootDir>/.cache/babel'
    }]
  },

  // ─── TIMING & EXECUTION ───
  testTimeout: 15000, // Slightly generous for DOM/async tests
  slowTestThreshold: 3000, // Warn if test takes over 3s

  // ─── GLOBAL LIFECYCLE ───
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',

  // ─── CLEANLINESS ───
  clearMocks: true, // Auto-reset mocks between tests
  restoreMocks: true, // Restore original implementations
  resetModules: false, // Keep fast — set true if you need total isolation

  // ─── OUTPUT ───
  verbose: true,
  silent: false,

  // ─── ERROR HANDLING ───
  bail: false, // Run ALL tests even if one fails
  errorOnDeprecated: true, // Warn about outdated APIs
  detectLeaks: true, // Catch memory leaks
  detectOpenHandles: true // Catch hanging connections/promises
};
