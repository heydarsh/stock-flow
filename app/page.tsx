"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Search, ArrowRight, Star, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Autocomplete from "@/components/ui/autocomplete"
import { mockStocks } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-1x6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Invest in your
            <span className="text-green-600 block">Financial Future</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your investment journey with zero commission trading, real-time market data, and expert insights.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            
          </motion.div>
        </motion.div>
      </section>



      {/* Add image above footer */}
      <div className="flex justify-center my-8">
        <Image
          src="/main.jpg"
          alt="Stock Dashboard"
          width={900}
          height={600}
          className="rounded-lg shadow-lg"
        />
      </div>
      <Footer />
    </div>
  )
}
