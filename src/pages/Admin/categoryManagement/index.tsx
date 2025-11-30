import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  ShoppingBag,
  Laptop,
  Home,
  Smartphone,
  Headphones,
  Watch,
  Camera,
  Book,
  Shirt,
  Utensils,
} from "lucide-react";
import { Button } from "../../../components/UI/button";
import axiosInstance from "../../../api/axiosInstance";
import Toast from "../../../components/UI/toast"; // ✅ import your Toast component

// Category type definition
interface Category {
  id: number;
  name: string;
  description: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  default: ShoppingBag,
  electronics: Laptop,
  home: Home,
  mobile: Smartphone,
  audio: Headphones,
  watches: Watch,
  camera: Camera,
  books: Book,
  fashion: Shirt,
  food: Utensils,
};
interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Toast State
  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  });

  // ✅ Fetch all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/admin/categories");
      setCategories(response.data || []);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (name: string): React.ElementType => {
    const lowerName = name.toLowerCase();
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (lowerName.includes(key)) return Icon;
    }
    return categoryIcons.default;
  };

  // ✅ Create new category with toast
  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Please fill in all fields");
      return;
    }
    setError("");

    try {
      await axiosInstance.post("/admin/categories", formData);
      await fetchCategories();
      resetForm();

      // ✅ Show success toast
      setToast({
        isOpen: true,
        type: "success",
        message: "Category created successfully!",
      });
    } catch (err) {
      setError("Error saving category");
      setToast({
        isOpen: true,
        type: "error",
        message: "Failed to create category!",
      });
    }
  };

  // ✅ Delete category with toast
  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setDeleteId(null);

      // ✅ Show success toast
      setToast({
        isOpen: true,
        type: "success",
        message: "Category deleted successfully!",
      });
    } catch (err) {
      setError("Error deleting category");
      setToast({
        isOpen: true,
        type: "error",
        message: "Failed to delete category!",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setShowForm(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* ✅ Toast Component */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast({
            ...toast,
            isOpen: false,
            message: "",
            type: "success",
          })
        }
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent shadow-md">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Category Management
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and organize your product categories
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              variant="default"
              className="px-4 py-2 h-10 border-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">All Categories</h2>
            <span className="px-4 py-2 bg-gradient-to-r from-[#5d33fb] to-purple-600 text-white rounded-full text-sm font-semibold shadow-md">
              {categories.length}{" "}
              {categories.length === 1 ? "Category" : "Categories"}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#5d33fb] border-t-transparent"></div>
              <p className="mt-4 text-slate-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-md border-2 border-dashed border-slate-300">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag size={40} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium mb-2">
                No categories yet
              </p>
              <p className="text-slate-400 text-sm">
                Click "Add Category" to create your first category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = getIconForCategory(category.name);
                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-slate-200 group hover:border-[#5d33fb] hover:-translate-y-1 relative"
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDeleteId(category.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center pt-2">
                      <div className="p-3 bg-gradient-to-br from-[#5d33fb]/10 to-purple-100 rounded-xl group-hover:from-[#5d33fb]/20 group-hover:to-purple-200 transition-all mb-3">
                        <Icon size={32} className="text-[#5d33fb]" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#5d33fb] transition-colors line-clamp-2">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#5d33fb] to-purple-600 rounded-lg shadow-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Add New Category
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Electronics, Fashion, Books"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5d33fb] focus:border-[#5d33fb] outline-none transition bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the category"
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5d33fb] focus:border-[#5d33fb] outline-none transition resize-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#5d33fb] to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-[#4d23eb] hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <Save size={16} />
                    Create
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Delete Category
                </h2>
              </div>

              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
