"use client"

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CandlestickChartProps {
  data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  height?: number
}

export default function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  // Transform data for candlestick representation
  const chartData = data.map((item) => ({
    ...item,
    price: item.close,
    candlestick: [item.low, item.open, item.close, item.high],
    bodyColor: item.close >= item.open ? "#16a34a" : "#dc2626",
    wickColor: "#6b7280",
  }))

  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props
    if (!payload) return null

    const [low, open, close, high] = payload.candlestick
    const isGreen = close >= open
    const color = isGreen ? "#16a34a" : "#dc2626"

    // Calculate positions
    const yScale = (value: number) => {
      const range = Math.max(...data.map((d) => d.high)) - Math.min(...data.map((d) => d.low))
      const min = Math.min(...data.map((d) => d.low))
      return y + height - ((value - min) / range) * height
    }

    const openY = yScale(open)
    const closeY = yScale(close)
    const highY = yScale(high)
    const lowY = yScale(low)
    const bodyHeight = Math.abs(closeY - openY)
    const bodyY = Math.min(openY, closeY)

    return (
      <g>
        {/* Wick */}
        <line x1={x + width / 2} y1={highY} x2={x + width / 2} y2={lowY} stroke="#6b7280" strokeWidth={1} />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={Math.max(bodyHeight, 1)}
          fill={color}
          stroke={color}
        />
      </g>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <YAxis
            yAxisId="volume"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (name === "volume") return [`${(value / 1000000).toFixed(2)}M`, "Volume"]
              return [`$${value.toFixed(2)}`, name]
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />

          {/* Volume bars */}
          <Bar yAxisId="volume" dataKey="volume" fill="#e2e8f0" opacity={0.3} />

          {/* Price line */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#16a34a" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
