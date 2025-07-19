import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from 'next/headers'
import clientPromise from "@/lib/mongodb"

const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 // 30 days in seconds
const ACCESS_TOKEN_EXPIRY = 15 * 60 // 15 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    const refreshToken = cookies().get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "Refresh token required" }, { status: 401 })
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { 
        userId: string;
        email: string;
        type: 'refresh';
      }
    } catch {
      return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 })
    }

    // Verify token type
    if (decoded.type !== 'refresh') {
      return NextResponse.json({ success: false, message: "Invalid token type" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    // Get user and verify session
    const user = await users.findOne({ 
      _id: decoded.userId,
      'sessions.refreshToken': refreshToken 
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 401 })
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )

    const newRefreshToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    // Update session
    await users.updateOne(
      { _id: user._id, 'sessions.refreshToken': refreshToken },
      { 
        $set: { 
          'sessions.$.refreshToken': newRefreshToken,
          'sessions.$.lastUsed': new Date()
        }
      }
    )

    // Set cookies
    const response = NextResponse.json({ 
      success: true,
      accessToken: newAccessToken
    })

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY
    })

    return response
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
