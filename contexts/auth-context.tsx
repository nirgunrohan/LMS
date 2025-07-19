"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "@/lib/types"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, userType: "user" | "admin") => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call your API endpoint for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { success, user: userData, token } = await response.json();
      
      if (!success) {
        throw new Error('Login failed');
      }

      // Store the token
      localStorage.setItem('token', token);
      
      // Store user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    userType: "user" | "admin",
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, userType }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const { success, message } = await response.json();
      
      if (!success) {
        throw new Error(message || 'Registration failed');
      }

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
