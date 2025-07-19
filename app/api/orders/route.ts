import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all orders (admin) or user orders
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

    let query = {}
    if (decoded.userType !== "admin") {
      query = { userId: decoded.userId }
    }

    const ordersList = await orders.find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      orders: ordersList,
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { clothingType, quantity, pickupDate } = await request.json()

    if (!clothingType || !quantity || !pickupDate) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const orders = db.collection("orders")
    const users = db.collection("users")

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Calculate total amount based on clothing type
    const priceMap = {
      "Regular Wash": 2.5,
      "Dry Clean": 8.99,
      Delicate: 4.5,
      "Heavy Duty": 3.5,
    }

    const pricePerItem = priceMap[clothingType as keyof typeof priceMap] || 2.5
    const totalAmount = pricePerItem * quantity

    // Create order
    const result = await orders.insertOne({
      userId: decoded.userId,
      userName: user.name,
      clothingType,
      quantity,
      pickupDate: new Date(pickupDate),
      status: "Pending",
      totalAmount,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: result.insertedId,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
