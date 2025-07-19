import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Update complaint status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status } = await request.json()
    const complaintId = params.id

    const client = await clientPromise
    const db = client.db("laundry_management")
    const complaints = db.collection("complaints")

    const result = await complaints.updateOne({ _id: new ObjectId(complaintId) }, { $set: { status } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Complaint not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully",
    })
  } catch (error) {
    console.error("Update complaint error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
