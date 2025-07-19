"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Users, MessageSquare, Trash2, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Order, Complaint, User } from "@/lib/types"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.userType !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchAdminData()
  }, [user, router])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [ordersRes, complaintsRes, usersRes] = await Promise.all([
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const ordersData = await ordersRes.json()
      const complaintsData = await complaintsRes.json()
      const usersData = await usersRes.json()

      if (ordersData.success) setOrders(ordersData.orders)
      if (complaintsData.success) setComplaints(complaintsData.complaints)
      if (usersData.success) setUsers(usersData.users)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Order updated",
          description: `Order status changed to ${status}`,
        })
        fetchAdminData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error updating order",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Order deleted",
          description: "Order has been removed successfully.",
        })
        fetchAdminData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error deleting order",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateComplaintStatus = async (complaintId: string, status: Complaint["status"]) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()
      if (data.success) {
        toast({
          title: "Complaint updated",
          description: `Complaint status changed to ${status}`,
        })
        fetchAdminData()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error updating complaint",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    totalUsers: users.filter((u) => u.userType === "user").length,
    openComplaints: complaints.filter((c) => c.status === "Open").length,
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6">
          <div className="px-6 py-2 bg-blue-50 border-r-4 border-blue-500">
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-blue-600 mr-3" />
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Package className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openComplaints}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">All Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage all laundry orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>{order.clothingType}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Select
                                value={order.status}
                                onValueChange={(value: Order["status"]) => handleUpdateOrderStatus(order._id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Picked">Picked</SelectItem>
                                  <SelectItem value="Washed">Washed</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.userType === "admin" ? "default" : "secondary"}>{user.userType}</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{orders.filter((o) => o.userId === user._id).length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="complaints">
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <Card key={complaint._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Complaint #{complaint._id.slice(-6)}</CardTitle>
                          <CardDescription>
                            From {complaint.userName} • Order #{complaint.orderId.slice(-6)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={complaint.status}
                            onValueChange={(value: Complaint["status"]) =>
                              handleUpdateComplaintStatus(complaint._id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          <Badge variant={complaint.status === "Resolved" ? "default" : "secondary"}>
                            {complaint.status}
                          </Badge>
                        </div>
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
                          <p className="text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
