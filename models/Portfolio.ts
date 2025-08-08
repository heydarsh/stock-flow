import mongoose from "mongoose"

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalInvested: {
    type: Number,
    required: true,
    min: 0,
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0,
  },
  gainLoss: {
    type: Number,
    required: true,
  },
  gainLossPercent: {
    type: Number,
    required: true,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
})

PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true })

export default mongoose.models.Portfolio || mongoose.model("Portfolio", PortfolioSchema)
