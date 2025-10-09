/**
 * Global Test Setup
 * Runs once before all tests
 */

module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST = 'true';
  
  // Set up test database or services if needed
  console.log('🧪 Setting up test environment...');
  
  // Mock external APIs
  process.env.OPENAI_API_KEY = 'test-api-key';
  process.env.YOUTUBE_API_KEY = 'test-youtube-key';
  process.env.SITE_URL = 'http://localhost:3000';
  
  console.log('✅ Test environment ready');
};