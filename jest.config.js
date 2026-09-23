// ==============================================================
// PLEADING SANITY — JEST TEST CONFIGURATION v2.1-FINAL
// Optimized · Fast · CI-Ready · Full Coverage · Memory-Safe
// Aligned: Next.js · Netlify · Vercel · Frontend Ecosystem
// Evolution, Not Erasure · pleadingSanity
// ==============================================================

module.exports = {
  // ─── ENVIRONMENT — Browser DOM for Frontend ───
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    pretendToBeVisual: true
  },

  // ─── SETUP — Run After Framework Loaded ───
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // ─── TEST FILE LOCATIONS ───
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // ─── EXCLUDE — No Tests Here ───
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.netlify/',
    '/.vercel/',
    '/dist/',
    '/build/',
    '/.next/',
    '/out/',
    '/coverage/',
    '/.cache/'
  ],

  // ─── PERFORMANCE — Balance Speed + Memory ───
  cache: true,
  cacheDirectory: '<rootDir>/.cache/jest',
  maxWorkers: process.env.CI ? '25%' : '50%', // Safer on CI runners
  haste: {
    maxWorkers: process.env.CI ? 2 : 4
  },

  // ─── COVERAGE — Quality Gates ───
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!node_modules/**',
    '!coverage/**',
    '!dist/**',
    '!build/**',
    '!.cache/**',
    '!.next/**',
    '!out/**',
    '!scripts/**',
    '!tests/**',
    '!netlify/functions/**',
    '!**/*.config.js',
    '!jest.config.js',
    '!next.config.js'
  ],

  // ─── PATH ALIASES — Match Import Structure ───
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '\\.(css|less|scss|sass|svg|png|jpg|jpeg|gif|webp|ico)$': 'identity-obj-proxy'
  },

  // ─── TRANSFORMATION — Modern JS + Next.js ───
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      cacheDirectory: '<rootDir>/.cache/babel'
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(next|@next|openai|axios)/)' // Transpile Next.js deps
  ],

  // ─── TIMING — Async & DOM-Friendly ───
  testTimeout: 15000,
  slowTestThreshold: 3000,

  // ─── LIFECYCLE — Global Hooks ───
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',

  // ─── STATE — Clean Between Tests ───
  clearMocks: true,
  restoreMocks: true,
  resetModules: false, // Keep fast — set true for full isolation

  // ─── OUTPUT — Clear & Actionable ───
  verbose: true,
  silent: false,

  // ─── QUALITY — Catch Problems Early ───
  bail: false, // Run ALL tests even if one fails
  errorOnDeprecated: true,
  detectLeaks: true,
  detectOpenHandles: true,
  forceExit: true, // Clean exit even if something hangs

  // ─── IGNORE PATTERNS ───
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/.git/'
  ]
};
