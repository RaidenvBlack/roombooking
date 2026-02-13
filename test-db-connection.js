const { testConnection } = require('./config/database');

async function main() {
  console.log('Testing database connection...');
  await testConnection();
  console.log('Test complete');
  process.exit(0);
}

main().catch(err => {
  console.error('Error in test script:', err);
  process.exit(1);
});