import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get all complaints (admin) or user complaints
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
    const complaints = db.collection("complaints")

    let query = {}
    if (decoded.userType !== "admin") {
      query = { userId: decoded.userId }
    }

    const complaintsList = await complaints.find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      complaints: complaintsList,
    })
  } catch (error) {
    console.error("Get complaints error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Create new complaint
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { orderId, issue, description } = await request.json()

    if (!orderId || !issue || !description) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("laundry_management")
    const complaints = db.collection("complaints")
    const users = db.collection("users")

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Create complaint
    const result = await complaints.insertOne({
      userId: decoded.userId,
      userName: user.name,
      orderId,
      issue,
      description,
      status: "Open",
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Complaint submitted successfully",
      complaintId: result.insertedId,
    })
  } catch (error) {
    console.error("Create complaint error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
