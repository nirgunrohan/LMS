import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
  }
}
