import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { createItem, updateItem, getItem } from "../../../api/item";

// Satisfy ESLint for motion usage
const __MOTION_REF__ = motion;

export default function ItemForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { itemId } = useParams();

  const isEdit = Boolean(itemId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "mobile",
    status: "available",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadItem = useCallback(async () => {
    if (!isEdit) return;
    try {
      setLoading(true);
      const res = await getItem(token, itemId);
      const it = res.data;
      setFormData({
        name: it.name || "",
        description: it.description || "",
        category: it.category || "mobile",
        status: it.status || "available",
        image: null,
      });
      setImagePreview(it.image || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  }, [isEdit, token, itemId]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, image: file || null }));
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name.trim());
    form.append("description", formData.description || "");
    form.append("category", formData.category || "mobile");
    form.append("status", formData.status);
    if (formData.image) form.append("image", formData.image);

    try {
      setLoading(true);
      if (isEdit) {
        await updateItem(token, itemId, form);
        toast.success("Item updated");
      } else {
        await createItem(token, form);
        toast.success("Item created");
      }
      navigate("/admin/items");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-5">
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
                {isEdit ? "Edit Item" : "Create Item"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isEdit ? "Update item details" : "Add a new catalog item"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/items")}
            className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow"
          >
            ✖ Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              >
                <option value="mobile">Mobile</option>
                <option value="smartphone">Smart Phone</option>
                <option value="accessories">Accessories</option>
                <option value="display">Display</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mt-2 border"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white hover:from-yellow-500 hover:to-amber-500 shadow disabled:opacity-60"
          >
            {isEdit ? "Update Item" : "Create Item"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
