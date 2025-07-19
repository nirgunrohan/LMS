import { MongoClient } from 'mongodb';

async function testConnection() {
  // Load environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB URI is not defined in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas!');
    
    const db = client.db('laundry_management');
    await db.command({ ping: 1 });
    console.log('Database ping successful!');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Try to find one user (without exposing sensitive data)
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    console.log(`\nNumber of users in database: ${userCount}`);

  } catch (error) {
    console.error('Connection error:', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.error('\nError: Could not reach MongoDB Atlas. Please check your internet connection.');
      } else if (error.message.includes('authentication failed')) {
        console.error('\nError: Authentication failed. Please check your username and password in the connection string.');
      } else if (error.message.includes('Invalid connection string')) {
        console.error('\nError: Invalid connection string. Please check your MongoDB URI format.');
      }
    }
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

testConnection();
