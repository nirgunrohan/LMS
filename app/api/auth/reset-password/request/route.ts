import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    const user = await users.findOne({ email })
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent" })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email, type: 'reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // Store reset token
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
        }
      }
    )

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
      `
    })

    return NextResponse.json({ 
      success: true, 
      message: "If an account exists, a reset link has been sent" 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
