"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Clock, Truck, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.userType === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Professional Laundry
            <span className="text-blue-600"> Made Simple</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Experience hassle-free laundry services with pickup and delivery right to your doorstep. Quality cleaning,
            convenient scheduling, and reliable service you can trust.
          </p>
          <div className="mt-10 space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Get Started Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Truck className="h-12 w-12 text-blue-600 mx-auto" />
              <CardTitle>Free Pickup & Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We collect and deliver your laundry at your convenience, completely free of charge.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-blue-600 mx-auto" />
              <CardTitle>24-48 Hour Service</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Quick turnaround time with most orders completed within 24-48 hours.</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto" />
              <CardTitle>Quality Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Professional cleaning with eco-friendly products and 100% satisfaction guarantee.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shirt className="h-12 w-12 text-blue-600 mx-auto" />
              <CardTitle>All Clothing Types</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                From everyday wear to delicate fabrics, we handle all types of clothing with care.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Wash & Fold</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Regular washing and folding service for everyday clothes.</p>
                <p className="text-2xl font-bold text-blue-600 mt-4">$2.50/lb</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dry Cleaning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Professional dry cleaning for delicate and formal wear.</p>
                <p className="text-2xl font-bold text-blue-600 mt-4">$8.99/item</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Express Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Same-day service for urgent laundry needs.</p>
                <p className="text-2xl font-bold text-blue-600 mt-4">+50% fee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
