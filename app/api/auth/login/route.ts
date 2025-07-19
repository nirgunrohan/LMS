import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import rateLimit from "@/lib/rate-limit"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting login process...');
    
    // Rate limiting based on IP
    try {
      await limiter.check(request, 5, 'LOGIN_RATE_LIMIT') // 5 attempts per minute
    } catch {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }
    
    console.log('✅ Rate limit check passed');

    const body = await request.json();
    console.log('📨 Received login request for:', body.email);
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    console.log('✅ Email format valid');

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    console.log('✅ Database connection established');
    
    // Find user
    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error);
    
    // Specific error handling
    if (error instanceof Error) {
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
