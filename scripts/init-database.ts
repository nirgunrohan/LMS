import { MongoClient } from 'mongodb';

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MongoDB URI is not defined in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const db = client.db('laundry_management');
    
    // Create Collections
    console.log('\n📁 Creating collections...');
    
    // Users Collection
    try {
      await db.createCollection('users');
      console.log('✅ Users collection created');
    } catch (error) {
      if ((error as Error).message.includes('Collection already exists')) {
        console.log('ℹ️ Users collection already exists');
      } else {
        throw error;
      }
    }

    // Create indexes
    console.log('\n📑 Creating indexes...');
    
    // Unique email index for users
    await db.collection('users').createIndex(
      { email: 1 }, 
      { 
        unique: true,
        name: 'email_unique',
        background: true
      }
    );
    console.log('✅ Created unique index on users.email');

    // Create indexes for orders
    await db.collection('orders').createIndex(
      { userId: 1 },
      { background: true }
    );
    await db.collection('orders').createIndex(
      { createdAt: -1 },
      { background: true }
    );
    console.log('✅ Created indexes for orders collection');

    // Create indexes for complaints
    await db.collection('complaints').createIndex(
      { userId: 1 },
      { background: true }
    );
    await db.collection('complaints').createIndex(
      { orderId: 1 },
      { background: true }
    );
    console.log('✅ Created indexes for complaints collection');

    // Create orders collection
    try {
      await db.createCollection('orders');
      console.log('✅ Orders collection created');
    } catch (error) {
      if ((error as Error).message.includes('Collection already exists')) {
        console.log('ℹ️ Orders collection already exists');
      } else {
        throw error;
      }
    }

    // Create complaints collection
    try {
      await db.createCollection('complaints');
      console.log('✅ Complaints collection created');
    } catch (error) {
      if ((error as Error).message.includes('Collection already exists')) {
        console.log('ℹ️ Complaints collection already exists');
      } else {
        throw error;
      }
    }

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Database Status:');
    console.log('Collections found:', collections.map(c => c.name).join(', '));

    // Count documents in each collection
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }

    console.log('\n✅ Database initialization completed successfully!');

  } catch (error) {
    console.error('\n❌ Database initialization error:', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.error('❌ Could not reach MongoDB Atlas. Please check your internet connection.');
      } else if (error.message.includes('authentication failed')) {
        console.error('❌ Authentication failed. Please check your database username and password.');
      } else if (error.message.includes('Invalid connection string')) {
        console.error('❌ Invalid connection string. Please check your MongoDB URI format.');
      }
    }
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Run the initialization
console.log('🚀 Starting database initialization...');
initializeDatabase();
