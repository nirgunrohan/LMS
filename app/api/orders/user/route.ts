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

    const client = await clientPromise
    const db = client.db("laundry_management")
    const orders = db.collection("orders")

    const userOrders = await orders.find({ userId: decoded.userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      orders: userOrders,
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
