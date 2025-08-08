
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function GET() {
  const csvPath = path.join(process.cwd(), "lib", "listing_status.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  const stocks = (parsed.data as any[])
    .filter(row => row.status && row.status.trim() === "Active")
    .map(row => ({ symbol: row.symbol, name: row.name }))
    .filter(stock => stock.symbol && stock.name);
  return NextResponse.json(stocks);
}
