import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Update order status
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
    const orderId = params.id

    const client = await clientPromise
    const db = client.db("laundry_management")
    const orders = db.collection("orders")

    const updateData: any = { status }
    if (status === "Delivered") {
      updateData.deliveryDate = new Date()
    }

    const result = await orders.updateOne({ _id: new ObjectId(orderId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Delete order
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const orderId = params.id

    const client = await clientPromise
    const db = client.db("laundry_management")
    const orders = db.collection("orders")

    const result = await orders.deleteOne({ _id: new ObjectId(orderId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error("Delete order error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
