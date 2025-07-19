import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { validatePassword } from "@/lib/password-validation"
import rateLimit from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting registration process...');
    
    // Rate limiting
    try {
      await limiter.check(request, 5, 'REGISTRATION_RATE_LIMIT') // 5 attempts per minute
    } catch {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }
    
    console.log('✅ Rate limit check passed');

    const body = await request.json();
    console.log('📨 Received registration request:', { ...body, password: '[REDACTED]' });
    
    const { name, email, password, userType } = body;

    if (!name || !email || !password || !userType) {
      console.log('❌ Missing required fields:', {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasUserType: !!userType
      });
      return NextResponse.json({ 
        success: false, 
        message: "All fields are required",
        missing: {
          name: !name,
          email: !email,
          password: !password,
          userType: !userType
        }
      }, { status: 400 })
    }
    
    console.log('✅ All required fields provided');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    console.log('✅ Email format validated');

    // Validate password strength
    const { isValid, errors } = validatePassword(password)
    if (!isValid) {
      console.log('❌ Password validation failed:', errors);
      return NextResponse.json({ success: false, message: errors.join(". ") }, { status: 400 })
    }

    console.log('✅ Password strength validated');

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    console.log('✅ Database connection established');

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
    }

    console.log('✅ Email availability confirmed');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Password hashed');

    // Create user
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
    })

    console.log('✅ User created successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        console.log('❌ Email already exists in database');
        return NextResponse.json({ 
          success: false, 
          message: "An account with this email already exists",
          code: "EMAIL_EXISTS"
        }, { status: 400 });
      }
      
      if (error.message.includes('ENOTFOUND') || error.message.includes('connect ETIMEDOUT')) {
        console.log('❌ Database connection error');
        return NextResponse.json({ 
          success: false, 
          message: "Unable to connect to database. Please try again later.",
          code: "DB_CONNECTION_ERROR"
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}