"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Menu, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(!!localStorage.getItem("token"))
    window.addEventListener("storage", () => setIsLoggedIn(!!localStorage.getItem("token")))
    return () => {
      window.removeEventListener("storage", () => setIsLoggedIn(!!localStorage.getItem("token")))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  if (!mounted) return null

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StockFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
              Markets
            </Link>
            <Link href="/portfolio" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
              Portfolio
            </Link>
            <Link href="/news" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
              News
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}> 
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} 
            </Button>
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors"
              >
                Portfolio
              </Link>
              <Link href="/news" className="text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
                News
              </Link>
              <div className="flex space-x-2 pt-4">
                {isLoggedIn ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/auth" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth" className="flex-1">
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
