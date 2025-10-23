import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../../api/items";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function MasterItemsPage() {
  // Reference for eslint when using <motion.*>
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const token = auth?.token;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchItems(token);
      setItems(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadItems();
  }, [token, loadItems]);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await createItem(token, {
        name: name.trim(),
        description: description.trim(),
      });
      setItems([res.data, ...items]);
      setName("");
      setDescription("");
      toast.success("Item added");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add item");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingName(item.name || "");
    setEditingDescription(item.description || "");
  };

  const saveEdit = async (id) => {
    try {
      await updateItem(token, id, {
        name: editingName.trim(),
        description: editingDescription.trim(),
      });
      setItems(
        items.map((it) =>
          it._id === id
            ? {
                ...it,
                name: editingName.trim(),
                description: editingDescription.trim(),
              }
            : it
        )
      );
      setEditingId(null);
      setEditingName("");
      setEditingDescription("");
      toast.success("Item updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update item");
    }
  };

  const remove = async (id) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteItem(token, id);
      setItems(items.filter((it) => it._id !== id));
      toast.success("Item deleted");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete item");
    }
  };

  const toggleVisible = async (it) => {
    try {
      const next = !it.visible;
      await updateItem(token, it._id, { visible: next });
      setItems(
        items.map((x) => (x._id === it._id ? { ...x, visible: next } : x))
      );
      toast.success(next ? "Item is now visible" : "Item hidden");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to toggle visibility");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-yellow-400 to-yellow-600 p-3 rounded-full shadow-md">
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
                d="M4 6h16M4 12h10M4 18h7"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
              Master Items
            </h1>
            <p className="text-gray-500 text-sm">
              Create, edit, toggle visibility
            </p>
          </div>
        </div>

        {/* Create form */}
        <form
          onSubmit={add}
          className="flex flex-col sm:flex-row gap-2 bg-white/80 border border-yellow-200 rounded-2xl p-4"
        >
          <input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-yellow-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-64"
            required
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-yellow-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-yellow-600 text-white shadow hover:bg-yellow-700"
          >
            Add
          </button>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-yellow-200 bg-white/80">
          {loading ? (
            <div className="p-4 space-y-2 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-yellow-100/60 rounded-2xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-gray-500">No items found.</p>
          ) : (
            <ul>
              {items.map((it) => (
                <li
                  key={it._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-100 p-3"
                >
                  {editingId === it._id ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-3 py-2 border border-yellow-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-64"
                      />
                      <input
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="px-3 py-2 border border-yellow-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      {it.description && (
                        <div className="text-sm text-gray-600 truncate">
                          {it.description}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {/* Visible toggle */}
                    <label className="flex items-center gap-2 text-sm select-none">
                      <input
                        type="checkbox"
                        checked={!!it.visible}
                        onChange={() => toggleVisible(it)}
                      />
                      <span
                        className={
                          it.visible ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        {it.visible ? "Visible" : "Hidden"}
                      </span>
                    </label>

                    {editingId === it._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(it._id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                            setEditingDescription("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(it)}
                          className="px-3 py-1.5 rounded-xl bg-yellow-500 text-white shadow hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(it._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white shadow hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
