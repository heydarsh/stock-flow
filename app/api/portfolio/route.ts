import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Portfolio from "@/models/Portfolio"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const holdings = await Portfolio.find({ userId: decoded.userId }).sort({ lastUpdated: -1 })

    // Fetch live prices and recalculate values for each holding
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const stockRes = await fetch(`${request.nextUrl.origin}/api/stocks/${holding.symbol}`)
          const stockData = await stockRes.json()
          const livePrice = typeof stockData.price === "number" && !isNaN(stockData.price)
            ? stockData.price
            : holding.currentPrice // fallback to saved price if API fails

          const currentValue = holding.quantity * livePrice
          const gainLoss = currentValue - holding.totalInvested
          const gainLossPercent = holding.totalInvested > 0 ? (gainLoss / holding.totalInvested) * 100 : 0

          return {
            ...holding.toObject(),
            currentPrice: livePrice,
            currentValue,
            gainLoss,
            gainLossPercent,
          }
        } catch (err) {
          // If API fails, return holding with saved price
          return {
            ...holding.toObject(),
          }
        }
      })
    )

    // Calculate summary from updated holdings
    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalInvested, 0)
    const totalGainLoss = totalValue - totalInvested
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

    return NextResponse.json({
      holdings: updatedHoldings,
      summary: {
        totalValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPercent,
        holdingsCount: updatedHoldings.length,
      },
    })
  } catch (error) {
    // console.error("Get portfolio error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { symbol, quantity, price, type } = await request.json()


    // Fetch current stock price
    const stockResponse = await fetch(`${request.nextUrl.origin}/api/stocks/${symbol}`)
    const stockData = await stockResponse.json()

    // Validate stock price
    if (!stockData || typeof stockData.price !== "number" || isNaN(stockData.price)) {
      return NextResponse.json({ error: "Unable to fetch valid stock price. Please try again later or check your API keys." }, { status: 400 })
    }

    let portfolio = await Portfolio.findOne({ userId: decoded.userId, symbol })

    if (!portfolio) {
      if (type === "SELL") {
        return NextResponse.json({ error: "Cannot sell stock you don't own" }, { status: 400 })
      }

      // Create new portfolio entry
      portfolio = new Portfolio({
        userId: decoded.userId,
        symbol,
        name: stockData.name,
        quantity,
        averagePrice: price,
        currentPrice: stockData.price,
        totalInvested: quantity * price,
        currentValue: quantity * stockData.price,
        gainLoss: quantity * stockData.price - quantity * price,
        gainLossPercent: ((stockData.price - price) / price) * 100,
        transactions: [
          {
            type: "BUY",
            quantity,
            price,
            total: quantity * price,
          },
        ],
      })
    } else {
      // Update existing portfolio entry
      const transaction = {
        type,
        quantity,
        price,
        total: quantity * price,
        date: new Date(),
      }

      if (type === "BUY") {
        const newTotalQuantity = portfolio.quantity + quantity
        const newTotalInvested = portfolio.totalInvested + quantity * price
        portfolio.averagePrice = newTotalInvested / newTotalQuantity
        portfolio.quantity = newTotalQuantity
        portfolio.totalInvested = newTotalInvested
      } else if (type === "SELL") {
        if (portfolio.quantity < quantity) {
          return NextResponse.json({ error: "Insufficient shares to sell" }, { status: 400 })
        }
        portfolio.quantity -= quantity
        portfolio.totalInvested -= quantity * portfolio.averagePrice
      }

      portfolio.currentPrice = stockData.price
      portfolio.currentValue = portfolio.quantity * stockData.price
      portfolio.gainLoss = portfolio.currentValue - portfolio.totalInvested
      portfolio.gainLossPercent = portfolio.totalInvested > 0 ? (portfolio.gainLoss / portfolio.totalInvested) * 100 : 0
      portfolio.transactions.push(transaction)
      portfolio.lastUpdated = new Date()

      // Remove portfolio entry if quantity becomes 0
      if (portfolio.quantity === 0) {
        await Portfolio.deleteOne({ _id: portfolio._id })
        return NextResponse.json({ message: "Position closed successfully" })
      }
    }

    await portfolio.save()
    return NextResponse.json(portfolio)
  } catch (error) {
    // console.error("Portfolio transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
