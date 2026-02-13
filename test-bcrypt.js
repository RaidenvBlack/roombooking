const bcrypt = require('bcryptjs');

async function testBcrypt() {
  const password = 'admin123';
  const existingHash = '$2b$10$rPQcLj1FkzUV1.Ep9ToRY.7aDQJZ5qQd6VZBJQPj7upeUQsc7.1Hy';
  
  // Test if the existing hash matches the password
  const isMatch = await bcrypt.compare(password, existingHash);
  console.log(`Existing hash matches 'admin123': ${isMatch}`);
  
  // Generate a new hash for the password
  const saltRounds = 10;
  const newHash = await bcrypt.hash(password, saltRounds);
  console.log(`New hash for 'admin123': ${newHash}`);
  
  // Test if the new hash matches the password
  const isNewMatch = await bcrypt.compare(password, newHash);
  console.log(`New hash matches 'admin123': ${isNewMatch}`);
}

testBcrypt().catch(console.error);