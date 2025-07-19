import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Try to connect to MongoDB
    const client = await clientPromise
    const db = client.db("laundry_management")
    
    // Try a simple operation
    await db.command({ ping: 1 })
    
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful",
      database: "laundry_management"
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "MongoDB connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
