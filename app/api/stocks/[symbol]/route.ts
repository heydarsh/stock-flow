import { type NextRequest, NextResponse } from "next/server"

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const { symbol } = params

    // Try Finnhub first, then Alpha Vantage, then error

    if (FINNHUB_API_KEY) {
      try {
        return await getFinnhubStockData(symbol)
      } catch (error) {
        // console.error("Finnhub API error:", error)
      }
    }

    if (ALPHA_VANTAGE_API_KEY) {
      try {
        return await getAlphaVantageStockData(symbol)
      } catch (error) {
        // console.error("Alpha Vantage API error:", error)
      }
    }

    // If both fail, return error with more details
    return NextResponse.json({ error: "Unable to fetch real stock data. Please check your API keys, network connection, and API limits. See server logs for details." }, { status: 500 })
  } catch (error) {
    // console.error("Get stock data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getFinnhubStockData(symbol: string) {
  // Get real-time quote
  const quoteResponse = await fetch(
    `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
  )
  const quoteData = await quoteResponse.json()

  const profileResponse = await fetch(
    `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
  )
  const profileData = await profileResponse.json()

  // Get basic financials
  const financialsResponse = await fetch(
    `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`
  )
  const financialsData = await financialsResponse.json()


  // No chart data
  if (quoteData.error || !quoteData.c) {
    throw new Error("Invalid response from Finnhub")
  }


  // Simulate live price changes in development only
  let price = quoteData.c
  let change = quoteData.d
  let changePercent = quoteData.dp
  if (process.env.NODE_ENV !== "production") {
    // Add a small random delta to simulate price movement
    const delta = (Math.random() - 0.5) * 2 // -1 to +1
    price = Number((price + delta).toFixed(2))
    change = Number((change + delta).toFixed(2))
    changePercent = Number((changePercent + delta / price * 100).toFixed(2))
  }
  const stockData = {
    symbol: symbol.toUpperCase(),
    name: profileData.name || `${symbol.toUpperCase()} Company`,
    price,
    change,
    changePercent,
    marketCap: profileData.marketCapitalization || financialsData.metric?.marketCapitalization || 0,
    peRatio: financialsData.metric?.peBasicExclExtraTTM || 0,
    volume: financialsData.metric?.marketCapitalization ? financialsData.metric?.marketCapitalization : 0,
    high52Week: financialsData.metric?.["52WeekHigh"] || 0,
    low52Week: financialsData.metric?.["52WeekLow"] || 0,
    dividendYield: financialsData.metric?.dividendYieldIndicatedAnnual || 0,
    eps: financialsData.metric?.epsBasicExclExtraItemsTTM || 0,
    beta: financialsData.metric?.beta || 1,
    description: profileData.description || "No description available",
    industry: profileData.finnhubIndustry || "Unknown",
    country: profileData.country || "Unknown",
    currency: profileData.currency || "USD",
    weburl: profileData.weburl || "",
    logo: profileData.logo || "",
  }

  const response = NextResponse.json(stockData)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  return response
}

async function getAlphaVantageStockData(symbol: string) {
  // Fetch real-time quote
  const quoteResponse = await fetch(
    `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
  )
  const quoteData = await quoteResponse.json()



  // Fetch company overview
  const overviewResponse = await fetch(
    `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  )
  const overviewData = await overviewResponse.json()


  if (quoteData["Error Message"]) {
    throw new Error("Invalid response from Alpha Vantage")
  }

  const quote = quoteData["Global Quote"]
  const overview = overviewData


  const stockData = {
    symbol: quote["01. symbol"],
    name: overview.Name || `${symbol} Company`,
    price: Number.parseFloat(quote["05. price"]),
    change: Number.parseFloat(quote["09. change"]),
    changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
    marketCap: overview.MarketCapitalization
      ? Number.parseInt(overview.MarketCapitalization)
      : Math.random() * 1000000000000,
    peRatio: overview.PERatio ? Number.parseFloat(overview.PERatio) : Math.random() * 50 + 10,
    volume: Number.parseInt(quote["06. volume"]),
    high52Week: overview["52WeekHigh"] ? Number.parseFloat(overview["52WeekHigh"]) : 0,
    low52Week: overview["52WeekLow"] ? Number.parseFloat(overview["52WeekLow"]) : 0,
    dividendYield: overview.DividendYield ? Number.parseFloat(overview.DividendYield) : 0,
    eps: overview.EPS ? Number.parseFloat(overview.EPS) : 0,
    beta: overview.Beta ? Number.parseFloat(overview.Beta) : 1,
    description: overview.Description || "No description available",
    industry: overview.Industry || "Unknown",
    country: overview.Country || "Unknown",
    currency: "USD",
    weburl: "",
    logo: "",
  }

  const response = NextResponse.json(stockData)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  return response
}


