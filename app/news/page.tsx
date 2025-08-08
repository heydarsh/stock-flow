"use client"


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Newspaper, Search, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Autocomplete from "@/components/ui/autocomplete"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    fetchNews()
    // Set up interval to update news every 24 hours (1 day)
    const interval = setInterval(fetchNews, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [activeTab])


  const fetchNews = async () => {
    setLoading(true)
    try {
      const url = `/api/news?category=${activeTab}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setNews(data.articles)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (sentiment < -0.2) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (sentiment < -0.2) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return "Positive"
    if (sentiment < -0.2) return "Negative"
    return "Neutral"
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
          <div className="flex items-center mb-4">
            <Newspaper className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market News</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest market news and insights powered by Finnhub.
          </p>
        </motion.div>



        {/* News Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="merger">M&A</TabsTrigger>
              <TabsTrigger value="ipo">IPO</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((article, index) => (
                    <motion.div
                      key={article.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                        <CardContent className="p-0">
                          {article.urlToImage && (
                            <img
                              src={article.urlToImage || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                              }}
                            />
                          )}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              {article.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {article.category}
                                </Badge>
                              )}
                              {article.sentiment !== undefined && (
                                <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                                  <span className="flex items-center gap-1">
                                    {getSentimentIcon(article.sentiment)}
                                    {getSentimentLabel(article.sentiment)}
                                  </span>
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                              {article.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDate(article.publishedAt)}
                              </div>
                              <span>{article.source}</span>
                            </div>

                            {article.url !== "#" && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-4 text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Read more
                                <ExternalLink className="w-4 h-4 ml-1" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
