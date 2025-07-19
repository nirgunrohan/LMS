export interface User {
  _id: string
  name: string
  email: string
  password: string
  userType: "user" | "admin"
  createdAt: Date
}

export interface Order {
  _id: string
  userId: string
  userName: string
  clothingType: string
  quantity: number
  pickupDate: Date
  deliveryDate?: Date
  status: "Pending" | "Picked" | "Washed" | "Delivered"
  totalAmount: number
  createdAt: Date
}

export interface Complaint {
  _id: string
  userId: string
  userName: string
  orderId: string
  issue: string
  description: string
  status: "Open" | "In Progress" | "Resolved"
  createdAt: Date
}

export interface AuthUser {
  id: string
  name: string
  email: string
  userType: "user" | "admin"
}
