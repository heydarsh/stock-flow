import { type NextRequest, NextResponse } from "next/server"
import { URL } from "url"

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const symbol = searchParams.get("symbol")
    const category = searchParams.get("category") || "general"

    if (!FINNHUB_API_KEY) {
      // Return mock news data if no API key
      return NextResponse.json(getMockNews(symbol))
    }

    let newsUrl: string

    if (symbol) {
      // Get company-specific news
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 7) // Last 7 days
      const toDate = new Date()
      
      newsUrl = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&token=${FINNHUB_API_KEY}`
    } else {
      // Get general market news
      newsUrl = `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`
    }

    const response = await fetch(newsUrl)
    const data = await response.json()

    if (response.status !== 200 || data.error) {
      return NextResponse.json(getMockNews(symbol))
    }

    // Process Finnhub news data
    const processedArticles = (Array.isArray(data) ? data : []).slice(0, 10).map((article: any) => ({
      id: article.id,
      title: article.headline,
      description: article.summary,
      url: article.url,
      urlToImage: article.image,
      publishedAt: new Date(article.datetime * 1000).toISOString(), // Convert Unix timestamp
      source: article.source,
      category: article.category,
      sentiment: article.sentiment, // Finnhub provides sentiment analysis
    }))

    return NextResponse.json({ articles: processedArticles })
  } catch (error) {
    // console.error("Finnhub API error:", error)
    const url = new URL(request.url)
    const searchParams = url.searchParams
    return NextResponse.json(getMockNews(searchParams.get("symbol")))
  }
}

function getMockNews(symbol?: string | null) {
  const mockArticles = [
    {
      id: "1",
      title: `${symbol || "Market"} Shows Strong Performance in Q4 Earnings`,
      description:
        "Company exceeds analyst expectations with robust revenue growth and positive outlook for the coming year.",
      url: "#",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: "Finnhub",
      category: "earnings",
      sentiment: 0.8,
    },
    {
      id: "2",
      title: `Analysts Upgrade ${symbol || "Tech Stocks"} Following Innovation Announcement`,
      description:
        "Multiple investment firms raise price targets following breakthrough technology release and market expansion plans.",
      url: "#",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: "Finnhub",
      category: "upgrade",
      sentiment: 0.6,
    },
    {
      id: "3",
      title: `${symbol || "Market"} Volatility Expected as Fed Announces Policy Changes`,
      description:
        "Federal Reserve policy changes expected to impact market sentiment and trading volumes in the coming weeks.",
      url: "#",
      urlToImage: "/placeholder.svg?height=200&width=300",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      source: "Finnhub",
      category: "policy",
      sentiment: -0.2,
    },
  ]

  return { articles: mockArticles }
}
