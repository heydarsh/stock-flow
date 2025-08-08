"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"

const NewsSection = ({ symbol }: { symbol: string }) => {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [symbol])

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news?symbol=${symbol}`)
      if (response.ok) {
        const data = await response.json()
        setNews(data.articles.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading news...</div>
  }

  return (
    <div className="space-y-4">
      {news.map((article, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{article.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <span>{article.source}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
  const [stock, setStock] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStockData()
  }, [params.symbol])

  const fetchStockData = async () => {
    try {
      const response = await fetch(`/api/stocks/${params.symbol}`)
      if (response.ok) {
        const data = await response.json()
        setStock(data)
      }
    } catch (error) {
      console.error("Error fetching stock data:", error)
    } finally {
      setLoading(false)
    }
  }







  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stock not found</h1>
            <Button asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Stock Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stock.symbol}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{stock.name}</p>
            </div>

          </div>

          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">${stock.price.toFixed(2)}</span>
            <div className={`flex items-center text-lg ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stock.change >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
              <span>
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}
              </span>
              <span className="ml-1">
                ({stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Key Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                  <span className="font-semibold">${(stock.marketCap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">P/E Ratio</span>
                  <span className="font-semibold">{stock.peRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="font-semibold">{(stock.volume / 1e6).toFixed(2)}M</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                    <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Daily Change</p>
                    <p className={`font-semibold ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
                    <p className="font-semibold">{stock.volume.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stock.name} is a leading company in its sector, providing innovative solutions and maintaining
                    strong market presence. The company has shown consistent growth and continues to expand its market
                    share through strategic initiatives.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Annual Revenue</span>
                        <span className="font-semibold">$125.2B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarterly Growth</span>
                        <span className="font-semibold text-green-600">+12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin</span>
                        <span className="font-semibold">23.4%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Valuation Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>P/E Ratio</span>
                        <span className="font-semibold">{stock.peRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EPS</span>
                        <span className="font-semibold">$8.45</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Book Value</span>
                        <span className="font-semibold">$45.20</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="news" className="mt-6">
              <NewsSection symbol={params.symbol} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
