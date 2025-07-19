'use client'

import { Shirt, Menu, X, User, Package, Settings, LogOut, Bell, Home, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "./ui/badge"

export function Header() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = user ? (
    user.userType === 'admin' ? [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/orders', label: 'Orders', icon: Package },
      { href: '/admin/customers', label: 'Customers', icon: User },
      { href: '/admin/reports', label: 'Reports', icon: FileText },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ] : [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/orders', label: 'My Orders', icon: Package },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/help', label: 'Help & Support', icon: HelpCircle },
    ]
  ) : []

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center group">
            <Shirt className="h-8 w-8 text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
            <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              LaundryPro
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <nav className="flex items-center gap-4 mr-4">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                        <Badge variant="secondary" className="ml-2">2</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <User className="h-6 w-6" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-gray-600" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Register</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
