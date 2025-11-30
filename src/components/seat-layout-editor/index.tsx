import React, { useState, useEffect } from "react";
import { Grid, Plus } from "lucide-react";
import Label from "../UI/label";
import { Input } from "../UI/input";
import { Button } from "../UI/button";

interface Seat {
  row: string;
  number: number;
  categoryName: string;
  color: string;
  price: number;
}

interface SeatLayoutData {
  rows: number;
  columns: number;
  seats: Seat[];
}

interface SeatLayoutEditorProps {
  onLayoutChange: (layout: SeatLayoutData) => void;
  initialLayout?: SeatLayoutData;
  seatsAvailable?: any; // external categories
  onCategoriesChange?: (categories: Category[]) => void;
}

interface Category {
  id: string;
  name: string;
  color: string;
  price: number;
}

const SeatLayoutEditor: React.FC<SeatLayoutEditorProps> = ({
  onLayoutChange,
  initialLayout,
  onCategoriesChange,
}) => {
  const [rows, setRows] = useState(initialLayout?.rows || 5);
  const [columns, setColumns] = useState(initialLayout?.columns || 10);
  const [selectedCategory, setSelectedCategory] = useState("Regular");
  const [seatGrid, setSeatGrid] = useState<{ [key: string]: string }>({});
  const [showGrid, setShowGrid] = useState(false);

  // 🔹 Category management
  const [categories, setCategories] = useState<Category[]>([
    { id: "Regular", name: "Regular", color: "#60a5fa", price: 1000 }, // default
    { id: "Walk", name: "Walk Space", color: "#C0C0C0", price: 0 }, // default
  ]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#facc15",
    price: "",
  });

  // 🔹 Load existing layout
  useEffect(() => {
    console.log(initialLayout?.seats);
    if (initialLayout?.seats?.length) {
      const preloadedGrid: { [key: string]: string } = {};
      initialLayout.seats.forEach((seat) => {
        const seatKey = `${seat.row}-${seat.number}`;
        preloadedGrid[seatKey] = seat.categoryName;
      });
      setSeatGrid(preloadedGrid);
      setRows(initialLayout.rows);
      setColumns(initialLayout.columns);
      setShowGrid(true);
    }
  }, [initialLayout]);

  useEffect(() => {
    if (!initialLayout?.seats?.length) return;

    const categoryMap = new Map<string, Category>();

    initialLayout.seats.forEach((seat) => {
      const name = seat.categoryName;
      if (!categoryMap.has(name)) {
        categoryMap.set(name, {
          id: name,
          name,
          color: seat.color || "#facc15",
          price: seat.price || 0,
        });
      }
    });

    const extractedCategories = Array.from(categoryMap.values());

    // Filter out categories that already exist
    const newCategories = extractedCategories.filter(
      (cat) => !categories.some((existing) => existing.name === cat.name)
    );
  
    if (newCategories.length) {
      const updated = [...categories, ...newCategories];
      setCategories(updated);
      onCategoriesChange?.(updated);
    }
  }, [initialLayout]);

  // 🔹 Generate default grid
  const generateGrid = () => {
    const newGrid: { [key: string]: string } = {};
    for (let r = 0; r < rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      for (let c = 1; c <= columns; c++) {
        newGrid[`${rowLetter}-${c}`] = "Regular";
      }
    }
    setSeatGrid(newGrid);
    setShowGrid(true);
    updateLayoutData(newGrid);
  };

  const assignCategory = (row: string, col: number) => {
    const seatKey = `${row}-${col}`;
    const newGrid = { ...seatGrid };
    newGrid[seatKey] = selectedCategory;
    setSeatGrid(newGrid);
    updateLayoutData(newGrid);
  };

  const updateLayoutData = (grid: { [key: string]: string }) => {
    const seats: Seat[] = Object.entries(grid).map(
      ([seatKey, categoryName]) => {
        const [row, numberStr] = seatKey.split("-");
        const number = parseInt(numberStr);

        const category = categories.find((cat) => cat.name === categoryName);

        return {
          row,
          number,
          categoryName,
          price: category?.price || 0,
          color: category?.color || "#facc15",
        };
      }
    );

    onLayoutChange({ rows, columns, seats });
  };

  const getSeatLabel = (row: string, col: number) => {
    const seatKey = `${row}-${col}`;
    const categoryName = seatGrid[seatKey];
    return categoryName === "SPACE" ? "" : `${row}${col}`;
  };

  const handleRowChange = (value: number) => {
    setRows(value);
    filterGrid(value, columns);
  };

  const handleColumnChange = (value: number) => {
    setColumns(value);
    filterGrid(rows, value);
  };

  const filterGrid = (newRows: number, newColumns: number) => {
    const filtered: { [key: string]: string } = {};
    Object.entries(seatGrid).forEach(([seatKey, category]) => {
      const [row, colStr] = seatKey.split("-");
      const col = Number(colStr);
      const rowIndex = row.charCodeAt(0) - 65;
      if (rowIndex < newRows && col <= newColumns) {
        filtered[seatKey] = category;
      }
    });
    setSeatGrid(filtered);
  };

  // 🔹 Add new category
  // 🔹 Add new category
  const addCategory = () => {
    if (!newCategory.name.trim()) return alert("Enter category name");

    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    );
    if (exists) return alert("Category already exists!");

    const category: Category = {
      id: newCategory.name.trim(),
      name: newCategory.name.trim(),
      color: newCategory.color,
      price: Number(newCategory.price) || 0,
    };

    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    setNewCategory({ name: "", color: "#facc15", price: "" });

    // 👈 sync with parent
    onCategoriesChange?.(updatedCategories);
  };

  // 🔹 Update category price
  const handlePriceChange = (categoryId: string, price: string) => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, price: Number(price) || 0 } : cat
    );
    setCategories(updatedCategories);

    // 👈 sync with parent
    onCategoriesChange?.(updatedCategories);
  };

  return (
    <div className="space-y-6 p-4 bg-linear-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Grid className="h-6 w-6 text-[#5d33fb]" />
        <h3 className="text-lg font-bold text-slate-800">
          Seat Layout Designer
        </h3>
      </div>

      {/* Grid Config */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>Rows</Label>
          <Input
            type="number"
            value={rows}
            onChange={(e) => handleRowChange(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
          />
        </div>
        <div>
          <Label>Columns</Label>
          <Input
            type="number"
            value={columns}
            onChange={(e) => handleColumnChange(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={generateGrid} className="w-full">
            <Plus className="h-4 w-4" /> Generate Grid
          </Button>
        </div>
      </div>

      {/* Add Category */}
      <div className="mb-6 border border-slate-200 rounded-lg p-4 bg-white">
        <Label className="mb-2 block font-semibold">Add New Category</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Input
              placeholder="Category name (e.g. VIP)"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <input
              type="color"
              value={newCategory.color}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, color: e.target.value }))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 border rounded cursor-pointer p-0"
            />
          </div>
          <Input
            type="number"
            placeholder="Price"
            value={newCategory.price}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, price: e.target.value }))
            }
          />
          <Button onClick={addCategory} className="bg-[#5d33fb] text-white">
            Add
          </Button>
        </div>
      </div>

      {/* Configure Category Prices */}
      <div className="mb-6">
        <Label className="font-semibold mb-2 block">
          Configure Category Prices
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories
            .filter((category) => category.id !== "Walk")
            .map((category) => (
              <div
                key={category.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-400"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-semibold text-slate-700 text-sm">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>₹</span>
                  <Input
                    type="number"
                    value={category.price || ""}
                    onChange={(e) =>
                      handlePriceChange(category.id, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Category Selector */}
      {showGrid && (
        <div className="mb-6">
          <Label className="font-semibold mb-3 block">Select Category</Label>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center border-2 rounded-lg p-3 cursor-pointer ${
                  selectedCategory === category.name
                    ? "border-[#5d33fb] bg-[#5d33fb]/10"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-400 mr-2"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Grid */}
      {showGrid && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">
            Click seats to assign categories
          </h4>
          <div className="bg-white p-4 rounded-xl border-2 border-slate-200 overflow-x-auto">
            <div className="text-center mb-4">
              <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold">
                🎭 STAGE 🎭
              </div>
            </div>
            <div
              className="grid gap-1 mx-auto justify-center"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(24px, 1fr))`,
                maxWidth: `${Math.min(columns * 45, 800)}px`,
              }}
            >
              {Array.from({ length: rows }, (_, rowIndex) => {
                const rowLetter = String.fromCharCode(65 + rowIndex);
                return Array.from({ length: columns }, (_, colIndex) => {
                  const colNumber = colIndex + 1;
                  const seatKey = `${rowLetter}-${colNumber}`;
                  const categoryName = seatGrid[seatKey];
                  const currentCat = categories.find(
                    (c) => c.name === categoryName
                  );
                  return (
                    <div
                      key={seatKey}
                      onClick={() => assignCategory(rowLetter, colNumber)}
                      className={`w-full aspect-square border-2 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition`}
                      style={{
                        backgroundColor: currentCat?.color || "#fff",
                      }}
                    >
                      {getSeatLabel(rowLetter, colNumber)}
                    </div>
                  );
                });
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full"
                >
                  <div
                    className="w-4 h-4 rounded border border-gray-400"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium">
                    {category.name} ₹{category.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatLayoutEditor;
