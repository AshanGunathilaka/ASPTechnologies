import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchOffer, createOffer, updateOffer } from "../../../api/offer";
import { fetchItems } from "../../../api/item";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const OfferForm = () => {
  const __MOTION_REF__ = motion;
  const { auth } = useAuth();
  const { offerId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(offerId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    selectedItems: [],
    startDate: "",
    endDate: "",
    status: "active",
    images: [],
  });
  const [previews, setPreviews] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [itemsRes, offerRes] = await Promise.all([
        fetchItems(auth.token),
        isEdit
          ? fetchOffer(auth.token, offerId)
          : Promise.resolve({ data: null }),
      ]);
      setItems(itemsRes.data || []);
      if (offerRes.data) {
        const o = offerRes.data;
        setFormData({
          title: o.title || "",
          description: o.description || "",
          selectedItems: (o.items || []).map((i) => i._id),
          startDate: (o.startDate || "").slice(0, 10),
          endDate: (o.endDate || "").slice(0, 10),
          status: o.status || "active",
          images: [],
        });
        setPreviews(o.images || []);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, offerId]);

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((s) => ({ ...s, images: files }));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (idx) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    setFormData((s) => ({
      ...s,
      images: s.images.filter((_, i) => i !== idx),
    }));
  };

  const itemOptions = useMemo(
    () => items.map((it) => ({ value: it._id, label: it.name })),
    [items]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.startDate || !formData.endDate)
      return toast.error("Dates are required");
    if (new Date(formData.endDate) < new Date(formData.startDate))
      return toast.error("End date must be after start date");

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("status", formData.status);
    form.append("startDate", formData.startDate);
    form.append("endDate", formData.endDate);
    formData.selectedItems.forEach((id) => form.append("items", id));
    formData.images.forEach((img) => form.append("images", img));

    try {
      setSaving(true);
      if (isEdit) {
        await updateOffer(auth.token, offerId, form);
        toast.success("Offer updated");
      } else {
        await createOffer(auth.token, form);
        toast.success("Offer created");
      }
      navigate("/admin/offers");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    const res = await Swal.fire({
      title: "Discard changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (res.isConfirmed) navigate("/admin/offers");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-800">
            {isEdit ? "Edit Offer" : "New Offer"}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 shadow disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-yellow-100/60 rounded-2xl" />
            <div className="h-24 bg-yellow-100/60 rounded-2xl" />
            <div className="h-24 bg-yellow-100/60 rounded-2xl" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <label className="block text-xs text-gray-500">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <label className="block text-xs text-gray-500">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 w-full min-h-28 border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <label className="block text-xs text-gray-500 mb-1">
                Select Items
              </label>
              <select
                multiple
                value={formData.selectedItems}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedItems: Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    ),
                  })
                }
                className="w-full h-40 border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {itemOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                <label className="block text-xs text-gray-500">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="mt-1 w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
                <label className="block text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="mt-1 w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <label className="block text-xs text-gray-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1 w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white/80 p-4 shadow-sm">
              <label className="block text-xs text-gray-500">
                Offer Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onFiles}
                className="mt-1 w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {previews?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default OfferForm;
