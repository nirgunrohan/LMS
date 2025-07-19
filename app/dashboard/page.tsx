"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MessageSquare, Package, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import OrderStatusCard from "@/components/order-status-card"
import type { Order, Complaint } from "@/lib/types"

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    clothingType: "",
    quantity: 1,
    pickupDate: "",
  })

  // New Complaint Form State
  const [newComplaint, setNewComplaint] = useState({
    orderId: "",
    issue: "",
    description: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.userType === "admin") {
      router.push("/admin")
      return
    }
    fetchUserData()
  }, [user, router])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [ordersRes, complaintsRes] = await Promise.all([
        fetch("/api/orders/user", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/complaints/user", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const ordersData = await ordersRes.json()
      const complaintsData = await complaintsRes.json()

      if (ordersData.success) setOrders(ordersData.orders)
      if (complaintsData.success) setComplaints(complaintsData.complaints)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOrder),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Order created successfully",
          description: "Your laundry order has been placed.",
        })
        setNewOrder({ clothingType: "", quantity: 1, pickupDate: "" })
        fetchUserData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error creating order",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newComplaint),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Complaint submitted",
          description: "We'll look into your issue shortly.",
        })
        setNewComplaint({ orderId: "", issue: "", description: "" })
        fetchUserData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error submitting complaint",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">LaundryPro</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6">
          <div className="px-6 py-2 bg-blue-50 border-r-4 border-blue-500">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-600 font-medium">Dashboard</span>
            </div>
          </div>
        </nav>
        <div className="absolute bottom-6 left-6">
          <Button variant="ghost" onClick={logout} className="text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>Fill in the details for your laundry order.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div>
                      <Label htmlFor="clothingType">Clothing Type</Label>
                      <Select
                        value={newOrder.clothingType}
                        onValueChange={(value) => setNewOrder({ ...newOrder, clothingType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clothing type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular Wash">Regular Wash</SelectItem>
                          <SelectItem value="Dry Clean">Dry Clean</SelectItem>
                          <SelectItem value="Delicate">Delicate</SelectItem>
                          <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupDate">Pickup Date</Label>
                      <Input
                        type="date"
                        value={newOrder.pickupDate}
                        onChange={(e) => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Order
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Raise Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Raise a Complaint</DialogTitle>
                    <DialogDescription>Let us know about any issues with your order.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateComplaint} className="space-y-4">
                    <div>
                      <Label htmlFor="orderId">Order</Label>
                      <Select
                        value={newComplaint.orderId}
                        onValueChange={(value) => setNewComplaint({ ...newComplaint, orderId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.map((order) => (
                            <SelectItem key={order._id} value={order._id}>
                              Order #{order._id.slice(-6)} - {order.clothingType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="issue">Issue Type</Label>
                      <Select
                        value={newComplaint.issue}
                        onValueChange={(value) => setNewComplaint({ ...newComplaint, issue: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Damaged Item">Damaged Item</SelectItem>
                          <SelectItem value="Missing Item">Missing Item</SelectItem>
                          <SelectItem value="Poor Quality">Poor Quality</SelectItem>
                          <SelectItem value="Late Delivery">Late Delivery</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        placeholder="Describe the issue in detail..."
                        value={newComplaint.description}
                        onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Complaint
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="complaints">My Complaints</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Create your first laundry order to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => <OrderStatusCard key={order._id} order={order} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="complaints">
              <div className="space-y-4">
                {complaints.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints</h3>
                      <p className="text-gray-600">You haven't raised any complaints yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  complaints.map((complaint) => (
                    <Card key={complaint._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Complaint #{complaint._id.slice(-6)}</CardTitle>
                            <CardDescription>Order #{complaint.orderId.slice(-6)}</CardDescription>
                          </div>
                          <Badge variant={complaint.status === "Resolved" ? "default" : "secondary"}>
                            {complaint.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-sm text-gray-600">Issue:</p>
                            <p>{complaint.issue}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Description:</p>
                            <p className="text-gray-700">{complaint.description}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-600">Submitted:</p>
                            <p className="text-sm text-gray-500">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
