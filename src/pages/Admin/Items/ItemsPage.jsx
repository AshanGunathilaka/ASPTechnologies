import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchItems, deleteItem } from "../../../api/item";

// Reference for ESLint framer-motion usage
const __MOTION_REF__ = motion;

const ItemsPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");

  // Load items from backend
  const loadItems = useCallback(async () => {
    try {
      const params = { visible: true };
      if (category && category !== "all") params.category = category;
      const { data } = await fetchItems(auth.token, params);
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load items");
    }
  }, [auth?.token, category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handle delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
      backdrop: `rgba(0,0,0,0.4)`,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteItem(auth.token, id);
      toast.success("Item deleted");
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  // no inline form here; creation/editing handled in ItemForm page

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M7 21l3-3m0 0l3 3m-3-3V3"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
                Items
              </h1>
              <p className="text-gray-500 text-sm">Manage your catalog items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/80 border border-yellow-200 rounded-xl p-2">
              <label className="text-sm text-gray-600 mr-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              >
                <option value="all">All</option>
                <option value="mobile">Mobile</option>
                <option value="smartphone">Smart Phone</option>
                <option value="accessories">Accessories</option>
                <option value="display">Display</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/items/new")}
              className="relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 shadow"
            >
              Create New Item
            </button>
          </div>
        </div>

        {/* Items grid */}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="border rounded-xl overflow-hidden shadow-sm bg-white"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/admin/items/${item._id}`)}
                  className="block w-full text-left"
                  title="View details"
                >
                  <div className="relative w-full max-w-[1280px] mx-auto aspect-square rounded-xl border overflow-hidden bg-gray-100">
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/1280x1280?text=No+Image"
                      }
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      width="1280"
                      height="1280"
                    />
                  </div>
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/items/${item._id}`)}
                      className="font-semibold text-amber-700 hover:underline"
                    >
                      {item.name}
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs border ${
                        item.status === "available"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {item.status === "available"
                        ? "Available"
                        : "Out of Stock"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-3 whitespace-pre-line">
                    {item.description}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => navigate(`/admin/items/${item._id}/edit`)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemsPage;
