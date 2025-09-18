"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Grid, Plus, Download } from "lucide-react"
import Label from "../UI/label"
import { Input } from "../UI/input"
import { Button } from "../UI/button"

// Type definitions
interface Seat {
  row: string
  number: number
  categoryName: string
}

interface SeatLayoutData {
  rows: number
  columns: number
  seats: Seat[]
}

interface SeatLayoutEditorProps {
  onLayoutChange: (layout: SeatLayoutData) => void
  initialLayout?: SeatLayoutData
}

interface Category {
  id: string
  name: string
  class: string
  color: string
  price: number
}

const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({ onLayoutChange, initialLayout }) => {
  const [rows, setRows] = useState(initialLayout?.rows || 5)
  const [columns, setColumns] = useState(initialLayout?.columns || 10)
  const [selectedCategory, setSelectedCategory] = useState("Regular")
  const [seatGrid, setSeatGrid] = useState<{ [key: string]: string }>({})
  const [showGrid, setShowGrid] = useState(false)

  const [categoryPrices, setCategoryPrices] = useState<{ [key: string]: number }>({
    VIP: 2000,
    Regular: 1000,
    Balcony: 500,
  })

  const categories: Category[] = [
    { id: "VIP", name: "VIP", class: "vip", color: "bg-yellow-400", price: categoryPrices["VIP"] || 0 },
    { id: "Regular", name: "Regular", class: "regular", color: "bg-blue-300", price: categoryPrices["Regular"] || 0 },
    { id: "Balcony", name: "Balcony", class: "balcony", color: "bg-green-300", price: categoryPrices["Balcony"] || 0 },
    { id: "SPACE", name: "Walk Space", class: "space", color: "bg-gray-200", price: 0 },
  ]

  // 🔹 Load initial layout (edit mode)
  useEffect(() => {
    if (initialLayout?.seats?.length) {
      const preloadedGrid: { [key: string]: string } = {}
      initialLayout.seats.forEach((seat) => {
        const seatKey = `${seat.row}-${seat.number}`
        preloadedGrid[seatKey] = seat.categoryName
      })
      setSeatGrid(preloadedGrid)
      setRows(initialLayout.rows)
      setColumns(initialLayout.columns)
      setShowGrid(true)
    }
  }, [initialLayout])

  const generateGrid = () => {
    setSeatGrid({})
    setShowGrid(true)
  }

  const assignCategory = (row: string, col: number) => {
    const seatKey = `${row}-${col}`
    const newGrid = { ...seatGrid }
    newGrid[seatKey] = selectedCategory
    setSeatGrid(newGrid)
    updateLayoutData(newGrid)
  }

  const updateLayoutData = (grid: { [key: string]: string }) => {
    const seats: Seat[] = Object.entries(grid).map(([seatKey, categoryName]) => {
      const [row, numberStr] = seatKey.split("-")
      const number = Number.parseInt(numberStr)
      return { row, number, categoryName }
    })
    onLayoutChange({ rows, columns, seats })
  }

  const getSeatClass = (row: string, col: number) => {
    const seatKey = `${row}-${col}`
    const categoryName = seatGrid[seatKey]
    const category = categories.find((cat) => cat.name === categoryName)
    return category ? category.color : "bg-white border-2 border-gray-300"
  }

  const getSeatLabel = (row: string, col: number) => {
    const seatKey = `${row}-${col}`
    const categoryName = seatGrid[seatKey]
    return categoryName === "SPACE" ? "" : `${row}${col}`
  }



  const handlePriceChange = (categoryName: string, price: string) => {
    setCategoryPrices((prev) => ({ ...prev, [categoryName]: Number(price) || 0 }))
  }

  const handleRowChange = (value: number) => {
    setRows(value)
    filterGrid(value, columns)
  }

  const handleColumnChange = (value: number) => {
    setColumns(value)
    filterGrid(rows, value)
  }

  const filterGrid = (newRows: number, newColumns: number) => {
    const filtered: { [key: string]: string } = {}
    Object.entries(seatGrid).forEach(([seatKey, category]) => {
      const [row, colStr] = seatKey.split("-")
      const col = Number(colStr)
      const rowIndex = row.charCodeAt(0) - 65
      if (rowIndex < newRows && col <= newColumns) {
        filtered[seatKey] = category
      }
    })
    setSeatGrid(filtered)
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Grid className="h-5 w-5 sm:h-6 sm:w-6 text-[#5d33fb]" />
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">Seat Layout Designer</h3>
      </div>

      {/* Grid Config */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-semibold text-slate-700 block">Rows</Label>
          <Input
            type="number"
            value={rows}
            onChange={(e) => handleRowChange(Number.parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="w-full h-9 sm:h-10 md:h-11 px-2 sm:px-3 text-sm sm:text-base border-2 border-slate-200 focus:border-[#5d33fb] focus:outline-none focus:ring-2 focus:ring-[#5d33fb]/20 rounded-lg transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-semibold text-slate-700 block">Columns</Label>
          <Input
            type="number"
            value={columns}
            onChange={(e) => handleColumnChange(Number.parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="w-full h-9 sm:h-10 md:h-11 px-2 sm:px-3 text-sm sm:text-base border-2 border-slate-200 focus:border-[#5d33fb] focus:outline-none focus:ring-2 focus:ring-[#5d33fb]/20 rounded-lg transition-all duration-200"
          />
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-end">
          <Button
            onClick={generateGrid}
            className="w-full bg-[#5d33fb] hover:bg-[#4c2bd9] active:bg-[#3f1fb8] text-white h-9 sm:h-10 md:h-11 flex items-center justify-center gap-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5d33fb]/50"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Generate Grid
          </Button>
        </div>
      </div>

      {/* Category Prices */}
      <div className="mb-6">
        <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 block">Configure Category Prices</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories
            .filter((c) => c.id !== "SPACE")
            .map((category) => (
              <div
                key={category.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-4 h-4 rounded-full ${category.color} border border-gray-400`}></div>
                  <span className="font-semibold text-slate-700 text-sm sm:text-base truncate">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-slate-600 font-medium">₹</span>
                  <Input
                    type="number"
                    value={categoryPrices[category.name] || ""}
                    onChange={(e) => handlePriceChange(category.name, e.target.value)}
                    className="flex-1 h-9 sm:h-10 px-3 text-sm sm:text-base border border-slate-300 focus:border-[#5d33fb] focus:ring-2 focus:ring-[#5d33fb]/20 rounded-lg transition-all duration-200"
                    min="0"
                    step="10"
                    placeholder="Enter price"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Category Selector */}
      {showGrid && (
        <div className="mb-6">
          <Label className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 block">Select Category</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center space-x-2 sm:space-x-3 border-2 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                  selectedCategory === category.name
                    ? "border-[#5d33fb] bg-[#5d33fb]/10 shadow-md"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <Input
                  type="radio"
                  name="seatCategory"
                  checked={selectedCategory === category.name}
                  onChange={() => setSelectedCategory(category.name)}
                  className="h-3 w-3 sm:h-4 sm:w-4 accent-[#5d33fb] cursor-pointer"
                />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0 ${category.color} border border-gray-400`}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium truncate">{category.name}</div>
                    {category.price && category.id !== "SPACE" && (
                      <div className="text-xs text-slate-500">₹{category.price}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Grid */}
      {showGrid && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
              Click seats to assign categories
            </h4>
            {/* <Button
              onClick={exportLayout}
              className="flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-[#5d33fb] hover:bg-slate-50 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5d33fb]/50"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Export Layout
            </Button> */}
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border-2 border-slate-200 overflow-x-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-block bg-gradient-to-r from-slate-800 to-slate-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base">
                🎭 STAGE 🎭
              </div>
            </div>

            <div
              className="grid gap-1 sm:gap-2 mx-auto justify-center"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(24px, 1fr))`,
                maxWidth: `${Math.min(columns * 45, 800)}px`,
              }}
            >
              {Array.from({ length: rows }, (_, rowIndex) => {
                const rowLetter = String.fromCharCode(65 + rowIndex)
                return Array.from({ length: columns }, (_, colIndex) => {
                  const colNumber = colIndex + 1
                  const seatKey = `${rowLetter}-${colNumber}`
                  const categoryName = seatGrid[seatKey]

                  return (
                    <div
                      key={seatKey}
                      className={`w-full aspect-square border-2 rounded-md text-[9px] sm:text-xs md:text-sm font-bold flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 ${getSeatClass(
                        rowLetter,
                        colNumber,
                      )} ${
                        categoryName === "SPACE"
                          ? "border-dashed cursor-default hover:scale-100"
                          : "border-solid hover:border-[#5d33fb]"
                      }`}
                      onClick={() => assignCategory(rowLetter, colNumber)}
                      style={{ minHeight: "24px", minWidth: "24px" }}
                    >
                      {getSeatLabel(rowLetter, colNumber)}
                    </div>
                  )
                })
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
              {categories
                .filter((c) => c.id !== "SPACE")
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-1 sm:gap-2 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                  >
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${category.color} border border-gray-400`}></div>
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                      {category.name} {categoryPrices[category.name] && `₹${categoryPrices[category.name]}`}
                    </span>
                  </div>
                ))}
              <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-200 border border-gray-400 border-dashed"></div>
                <span className="text-xs sm:text-sm font-medium">Walk Space</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatLayoutEditor
