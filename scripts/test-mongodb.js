import { MongoClient } from 'mongodb';

async function testConnection() {
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

  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
