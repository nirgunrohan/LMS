import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

async function createAdminUser() {
  try {
    const client = await clientPromise;
    const db = client.db("laundry_management");
    const users = db.collection("users");

    // Check if admin already exists
    const adminExists = await users.findOne({ userType: "admin" });
    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await hash("your-secure-password", 12);
    
    await users.insertOne({
      name: "Admin",
      email: "your-admin@email.com",
      password: hashedPassword,
      userType: "admin",
      createdAt: new Date(),
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
