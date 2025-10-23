import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createNote, getNote, updateNote } from "../../../api/notes";
import { fetchShops, fetchBills } from "../../../api/shops";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// Reference for eslint when using <motion.*>
const __MOTION_REF__ = motion;

export default function NoteForm() {
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();
  const { noteId } = useParams();

  const [shops, setShops] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "",
    content: "",
    priority: "Low",
    shop: "",
    bill: "",
    tags: "",
  });

  const loadShops = useCallback(async () => {
    try {
      const res = await fetchShops(token);
      setShops(res.data || []);
    } catch {
      /* silent */
    }
  }, [token]);

  const loadBills = useCallback(
    async (shopId) => {
      if (!shopId) {
        setBills([]);
        return;
      }
      try {
        const res = await fetchBills(token, shopId);
        setBills(res.data || []);
      } catch {
        /* silent */
      }
    },
    [token]
  );

  const loadExisting = useCallback(async () => {
    if (!noteId) return;
    try {
      const res = await getNote(token, noteId);
      const n = res.data;
      setForm({
        date: new Date(n.date).toISOString().slice(0, 10),
        title: n.title || "",
        content: n.content || "",
        priority: n.priority || "Low",
        shop: n.shop?._id || "",
        bill: n.bill?._id || "",
        tags: (n.tags || []).join(", "),
      });
      if (n.shop?._id) await loadBills(n.shop._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load note");
    }
  }, [noteId, token, loadBills]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);
  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const changeShop = async (shopId) => {
    setForm((f) => ({ ...f, shop: shopId, bill: "" }));
    await loadBills(shopId);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: form.date,
        title: form.title || undefined,
        content: form.content,
        priority: form.priority,
        shop: form.shop || undefined,
        bill: form.bill || undefined,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };
      if (noteId) {
        await updateNote(token, noteId, payload);
        toast.success("Note updated");
      } else {
        await createNote(token, payload);
        toast.success("Note created");
      }
      navigate("/admin/notes");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save note");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
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
                d="M3 7.5h18M3 12h18M3 16.5h18"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 tracking-tight">
              {noteId ? "Edit Note" : "Add Note"}
            </h1>
            <p className="text-gray-500 text-sm">Write or update a note</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/notes"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back
          </Link>
          {noteId && (
            <Link
              to={`/admin/notes/${noteId}/detail`}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              View
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="max-w-3xl mx-auto space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={change}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={change}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={change}
            className="w-full border p-2 rounded"
            rows={5}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={change}
              className="w-full border p-2 rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Shop (optional)
            </label>
            <select
              value={form.shop}
              onChange={(e) => changeShop(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">None</option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Bill (optional)
            </label>
            <select
              name="bill"
              value={form.bill}
              onChange={change}
              className="w-full border p-2 rounded"
              disabled={!form.shop}
            >
              <option value="">None</option>
              {bills.map((b) => (
                <option key={b._id} value={b._id}>
                  #{b.number}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={change}
            className="w-full border p-2 rounded"
            placeholder="e.g. urgent, follow-up"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/notes")}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow"
          >
            {noteId ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
