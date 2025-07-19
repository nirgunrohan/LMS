import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { authenticator } from 'otplib'
import qrcode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    // Generate secret
    const secret = authenticator.generateSecret()
    
    // Generate QR code
    const otpauth = authenticator.keyuri(
      userId,
      'LaundryPro',
      secret
    )
    
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth)

    // Store secret
    await users.updateOne(
      { _id: userId },
      { 
        $set: { 
          twoFactorSecret: secret,
          twoFactorEnabled: false // Will be enabled after verification
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      qrCode: qrCodeDataUrl,
      secret
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
