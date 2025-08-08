"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Search, Star, BarChart3 } from "lucide-react"
import Autocomplete from "@/components/ui/autocomplete"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stockOptions, setStockOptions] = useState<{ symbol: string; name: string }[]>([])
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null)
  const [stockDetails, setStockDetails] = useState<any>(null)
  const [stockNews, setStockNews] = useState<any[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [topGainers, setTopGainers] = useState<any[]>([])
  const [topLosers, setTopLosers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [livePulse, setLivePulse] = useState(false)

  useEffect(() => {
    // Fetch all stocks for Autocomplete
    fetch("/api/stocks")
      .then((res) => res.json())
      .then((data) => setStockOptions(Array.isArray(data) ? data : []))
      .catch(() => setStockOptions([]))
  }, [])

  useEffect(() => {
    fetchMarketData()
    fetchUserData()
    const interval = setInterval(fetchMarketData, 15000) // update every 15s
    const pulseInterval = setInterval(() => setLivePulse((v) => !v), 1000)
    return () => {
      clearInterval(interval)
      clearInterval(pulseInterval)
    }
  }, [])

  useEffect(() => {
    fetchMarketData()
    fetchUserData()
    const interval = setInterval(fetchMarketData, 15000) // update every 15s
    const pulseInterval = setInterval(() => setLivePulse((v) => !v), 1000)
    return () => {
      clearInterval(interval)
      clearInterval(pulseInterval)
    }
  }, [])
  // Fetch watchlist from API
  // Watchlist feature fully removed

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/auth"
        return
      }
      const response = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "NFLX", "AMD", "INTC"]
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(`/api/stocks/${symbol}`)
          if (res.ok) return await res.json()
          return null
        })
      )
      const stocks = results.filter(Boolean)
      setTopGainers(stocks.filter((s) => s.change > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 4))
      setTopLosers(stocks.filter((s) => s.change < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 4))
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setLoading(false)
    }
  }

  const StockCard = ({ stock, showAddButton = true }: { stock: any; showAddButton?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stock.name}</p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <motion.p
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              ${stock.price.toFixed(2)}
            </motion.p>
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex items-center text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}
              </span>
              <span className="ml-1">
                ({stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </motion.div>
          </div>
          <BarChart3 className="w-8 h-8 text-gray-400 group-hover:text-green-600 transition-colors" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening in the markets today.</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-md mb-8"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <Autocomplete
            options={stockOptions}
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={async (option) => {
              setSelectedStock(option)
              setSearchQuery(option.symbol)
              setDetailsLoading(true)
              try {
                const [detailsRes, newsRes] = await Promise.all([
                  fetch(`/api/stocks/${option.symbol}`),
                  fetch(`/api/news?symbol=${option.symbol}`)
                ])
                const details = detailsRes.ok ? await detailsRes.json() : null
                const news = newsRes.ok ? (await newsRes.json()).articles : []
                setStockDetails(details)
                setStockNews(news)
              } catch {
                setStockDetails(null)
                setStockNews([])
              } finally {
                setDetailsLoading(false)
              }
            }}
            placeholder="Search stocks, ETFs..."
          />
        </motion.div>


        {/* Stock Details, Chart, and News for selected company */}
        {selectedStock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mb-8 mx-auto w-full"
          >
            {detailsLoading ? (
              <div className="text-center text-gray-500 py-8">Loading stock data...</div>
            ) : stockDetails ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      {stockDetails.logo && <img src={stockDetails.logo} alt="logo" className="w-8 h-8 rounded-full" />} {stockDetails.name} <span className="text-gray-400 text-lg">({stockDetails.symbol})</span>
                    </h2>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stockDetails.industry} • {stockDetails.country}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stockDetails.description}</div>
                    {stockDetails.weburl && <a href={stockDetails.weburl} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 underline text-sm">Company Website</a>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">${stockDetails.price?.toFixed(2)}</div>
                    <div className={`text-sm font-semibold ${stockDetails.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stockDetails.change >= 0 ? "+" : ""}{stockDetails.change?.toFixed(2)} ({stockDetails.changePercent >= 0 ? "+" : ""}{stockDetails.changePercent?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">Market Cap</div>
                    <div className="font-bold text-lg">${stockDetails.marketCap?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">P/E Ratio</div>
                    <div className="font-bold text-lg">{stockDetails.peRatio?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">Volume</div>
                    <div className="font-bold text-lg">{stockDetails.volume?.toLocaleString()}</div>
                  </div>
                </div>
            {/* More Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">52 Week High</div>
                    <div className="font-bold">${stockDetails.high52Week?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">52 Week Low</div>
                    <div className="font-bold">${stockDetails.low52Week?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">Dividend Yield</div>
                    <div className="font-bold">{stockDetails.dividendYield ? `${stockDetails.dividendYield.toFixed(2)}%` : "-"}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">EPS</div>
                    <div className="font-bold">{stockDetails.eps?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">Beta</div>
                    <div className="font-bold">{stockDetails.beta?.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500">Currency</div>
                    <div className="font-bold">{stockDetails.currency}</div>
                  </div>
                </div>
                {/* News */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Related News</h3>
                  {stockNews.length === 0 ? (
                    <div className="text-gray-500">No news found for this stock.</div>
                  ) : (
                    <div className="space-y-4">
                      {stockNews.map((article) => (
                        <a key={article.url} href={article.url} target="_blank" rel="noopener noreferrer" className="block bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                          <div className="flex items-center gap-4">
                            {article.urlToImage && <img src={article.urlToImage} alt="news" className="w-16 h-16 object-cover rounded" />}
                            <div>
                              <div className="font-semibold text-lg mb-1">{article.title}</div>
                              <div className="text-gray-500 text-sm mb-1">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</div>
                              <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{article.description}</div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
       
      </div>
    </div>
  )
}
