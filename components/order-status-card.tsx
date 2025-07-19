"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Package, Truck, CheckCircle } from "lucide-react"
import type { Order } from "@/lib/types"

interface OrderStatusCardProps {
  order: Order
  onUpdateStatus?: (orderId: string, status: Order["status"]) => void
  showActions?: boolean
}

const statusConfig = {
  Pending: { color: "bg-yellow-500", icon: Package, text: "Pending Pickup" },
  Picked: { color: "bg-blue-500", icon: Truck, text: "Picked Up" },
  Washed: { color: "bg-purple-500", icon: Package, text: "Being Washed" },
  Delivered: { color: "bg-green-500", icon: CheckCircle, text: "Delivered" },
}

export default function OrderStatusCard({ order, onUpdateStatus, showActions = false }: OrderStatusCardProps) {
  const config = statusConfig[order.status]
  const Icon = config.icon

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    const statusFlow: Order["status"][] = ["Pending", "Picked", "Washed", "Delivered"]
    const currentIndex = statusFlow.indexOf(currentStatus)
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  }

  const nextStatus = getNextStatus(order.status)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order #{order._id.slice(-6)}</CardTitle>
          <Badge className={`${config.color} text-white`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Clothing Type</p>
            <p className="font-medium">{order.clothingType}</p>
          </div>
          <div>
            <p className="text-gray-600">Quantity</p>
            <p className="font-medium">{order.quantity} items</p>
          </div>
          <div>
            <p className="text-gray-600">Pickup Date</p>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              <p className="font-medium">{new Date(order.pickupDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium text-green-600">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {order.deliveryDate && (
          <div className="text-sm">
            <p className="text-gray-600">Delivery Date</p>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {showActions && onUpdateStatus && nextStatus && (
          <div className="pt-2 border-t">
            <Button size="sm" onClick={() => onUpdateStatus(order._id, nextStatus)} className="w-full">
              Mark as {nextStatus}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
