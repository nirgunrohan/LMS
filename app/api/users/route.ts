import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    if (decoded.userType !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const users = db.collection("users")

    const usersList = await users
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: usersList,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
