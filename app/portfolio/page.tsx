"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Autocomplete from "@/components/ui/autocomplete"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tradeForm, setTradeForm] = useState({
    symbol: "",
    quantity: "",
    price: "",
    type: "BUY",
  })
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [stockOptions, setStockOptions] = useState<{ symbol: string; name: string }[]>([])

  // Fetch all stocks for autocomplete dropdown
  useEffect(() => {
    async function fetchStocks() {
      try {
        const res = await fetch("/api/stocks")
        if (res.ok) {
          const data = await res.json()
          setStockOptions(data.stocks || [])
        }
      } catch (e) { /* ignore */ }
    }
    fetchStocks()
  }, [])

  useEffect(() => {
    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 15000) // update every 15s
    return () => clearInterval(interval)
  }, [])

  // Live badge animation state
  const [livePulse, setLivePulse] = useState(false)
  useEffect(() => {
    const pulseInterval = setInterval(() => setLivePulse((v) => !v), 1000)
    return () => clearInterval(pulseInterval)
  }, [])

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/auth"
        return
      }

      const response = await fetch("/api/portfolio", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        // Fetch live price for each holding
        if (data?.holdings?.length > 0) {
          const updatedHoldings = await Promise.all(
            data.holdings.map(async (holding: any) => {
              const res = await fetch(`/api/stocks/${holding.symbol}`)
              if (res.ok) {
                const live = await res.json()
                // Recalculate values with live price
                const currentPrice = live.price
                const currentValue = currentPrice * holding.quantity
                const gainLoss = currentValue - holding.totalInvested
                const gainLossPercent = (gainLoss / holding.totalInvested) * 100
                return {
                  ...holding,
                  currentPrice,
                  currentValue,
                  gainLoss,
                  gainLossPercent,
                  name: live.name,
                  ...live,
                }
              }
              return holding
            })
          )
          // Update summary with live data
          const totalValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0)
          const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalInvested, 0)
          const totalGainLoss = totalValue - totalInvested
          const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
          setPortfolio({
            ...data,
            holdings: updatedHoldings,
            summary: {
              ...data.summary,
              totalValue,
              totalInvested,
              totalGainLoss,
              totalGainLossPercent,
            },
          })
        } else {
          setPortfolio(data)
        }
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  const executeTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: tradeForm.symbol.toUpperCase(),
          quantity: Number.parseInt(tradeForm.quantity),
          price: Number.parseFloat(tradeForm.price),
          type: tradeForm.type,
        }),
      })

      if (response.ok) {
        setIsTradeDialogOpen(false)
        setTradeForm({ symbol: "", quantity: "", price: "", type: "BUY" })
        fetchPortfolio()
        alert(`${tradeForm.type} order executed successfully!`)
      } else {
        const error = await response.json()
        alert(error.error || "Trade failed")
      }
    } catch (error) {
      console.error("Error executing trade:", error)
      alert("Trade failed")
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
              <span
                className={`ml-4 flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 transition-all duration-500 ${livePulse ? 'shadow-lg' : ''}`}
                title="Live data: auto-refreshes every 2s"
              >
                <span className={`inline-block w-2 h-2 mr-1 rounded-full bg-green-500 animate-pulse`} />
                Live
              </span>
            </div>
            <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Trade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Execute Trade</DialogTitle>
                </DialogHeader>
                <form onSubmit={executeTrade} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Stock Symbol</label>
                    <Autocomplete
                      options={stockOptions}
                      value={tradeForm.symbol}
                      onChange={(val) => setTradeForm({ ...tradeForm, symbol: val })}
                      onSelect={(opt) => setTradeForm({ ...tradeForm, symbol: opt.symbol })}
                      placeholder="e.g., AAPL"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trade Type</label>
                    <Select
                      value={tradeForm.type}
                      onValueChange={(value) => setTradeForm({ ...tradeForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={tradeForm.quantity}
                      onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                      placeholder="Number of shares"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price per Share</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                      placeholder="0.00"
                      min="0.01"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Execute {tradeForm.type}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Track your investments and portfolio performance.</p>
        </motion.div>

        {/* Portfolio Summary */}
        {portfolio?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolio.summary.totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Current portfolio value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolio.summary.totalInvested.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Amount invested</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                {portfolio.summary.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${portfolio.summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${portfolio.summary.totalGainLoss.toFixed(2)}
                </div>
                <p className={`text-xs ${portfolio.summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {portfolio.summary.totalGainLossPercent >= 0 ? "+" : ""}
                  {portfolio.summary.totalGainLossPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolio.summary.holdingsCount}</div>
                <p className="text-xs text-muted-foreground">Different stocks</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Holdings */}
        {portfolio?.holdings?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.holdings.map((holding: any, index: number) => (
              <motion.div
                key={holding._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{holding.symbol}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{holding.name}</p>
                        <p className="text-xs text-gray-500">{holding.quantity} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${holding.currentValue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">@ ${holding.currentPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Avg. Cost:</span>
                        <span>${holding.averagePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Invested:</span>
                        <span>${holding.totalInvested.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Gain/Loss:</span>
                        <span className={holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                          ${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent >= 0 ? "+" : ""}
                          {holding.gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-16"
          >
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your portfolio is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start investing to build your portfolio.</p>
            <Button onClick={() => setIsTradeDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              Make Your First Trade
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
