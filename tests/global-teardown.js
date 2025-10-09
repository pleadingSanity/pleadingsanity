/**
 * Global Test Teardown
 * Runs once after all tests
 */

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up any test databases or services
  
  console.log('✅ Test cleanup complete');
};