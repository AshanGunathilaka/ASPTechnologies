import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchShops, createShop, deleteShop } from "../../../api/shops";
import ShopForm from "../../../components/Admin/shop/ShopForm";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;

export default function ShopsPage() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [shops, setShops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTown, setSelectedTown] = useState("");

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchShops(token);
      const list = Array.isArray(res?.data) ? res.data : [];
      setShops(list);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load shops");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadShops();
  }, [token, loadShops]);

  // Unique filter options
  const districtOptions = useMemo(() => {
    return Array.from(
      new Set((shops || []).map((s) => s.district).filter(Boolean))
    ).sort();
  }, [shops]);

  const townOptions = useMemo(() => {
    const source = selectedDistrict
      ? (shops || []).filter((s) => s.district === selectedDistrict)
      : shops || [];
    return Array.from(
      new Set(source.map((s) => s.area).filter(Boolean))
    ).sort();
  }, [shops, selectedDistrict]);

  // Apply filters
  const filteredShops = useMemo(() => {
    return (shops || []).filter((s) => {
      const name = (s.name || "").toLowerCase();
      const matchesName = name.includes(searchQuery.toLowerCase());
      const matchesDistrict = selectedDistrict
        ? s.district === selectedDistrict
        : true;
      const matchesTown = selectedTown ? s.area === selectedTown : true;
      return matchesName && matchesDistrict && matchesTown;
    });
  }, [shops, searchQuery, selectedDistrict, selectedTown]);

  const handleCreate = async (data) => {
    try {
      await createShop(token, data);
      toast.success("Shop created successfully!");
      setShowForm(false);
      loadShops();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this shop?",
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
      await deleteShop(token, id);
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Shop deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      loadShops();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
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
                d="M3 7h18M3 10h18m-9 7a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 drop-shadow-md tracking-tight mb-1 leading-[1.3] pb-1"
            >
              Shop Management
            </motion.h2>
            <p className="text-gray-500 text-sm mt-0">
              Manage your shops with ease ✨
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{
            scale: 1.07,
            boxShadow: "0px 4px 15px rgba(250, 204, 21, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm((s) => !s)}
          className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            showForm
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
              : "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-gray-900 hover:from-yellow-500 hover:to-amber-500"
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-xl"></span>
          <span className="relative flex items-center justify-center gap-2 z-10 text-white">
            {showForm ? (
              <>
                <span>✖</span> <span>Close Form</span>
              </>
            ) : (
              <>
                <span>➕</span> <span>Create Shop</span>
              </>
            )}
          </span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showForm ? 1 : 0, height: showForm ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
      >
        {showForm && <ShopForm onSubmit={handleCreate} />}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4 mb-4 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops by name..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedTown("");
              }}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white"
            >
              <option value="">All Districts</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedTown}
              onChange={(e) => setSelectedTown(e.target.value)}
              disabled={!selectedDistrict && townOptions.length === 0}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition bg-white disabled:opacity-60"
            >
              <option value="">All Towns</option>
              {townOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDistrict("");
              setSelectedTown("");
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-all"
          >
            Clear filters
          </button>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-gray-600 text-center mt-10 animate-pulse">
          Loading shops...
        </p>
      ) : shops.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center mt-10"
        >
          No shops found 😔
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {filteredShops.map((s, index) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-yellow-200"
            >
              {/* Logo */}
              {(s.logoUrl || (s.logo && s.logo.url) || s.logo) && (
                <div className="mb-3 flex justify-center">
                  <img
                    src={s.logoUrl || (s.logo && s.logo.url) || s.logo}
                    alt={`${s.name || "Shop"} Logo`}
                    className="w-32 h-36 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-yellow-300 shadow-md scale-[0.9]"
                    style={{ transformOrigin: "center" }}
                  />
                </div>
              )}

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 drop-shadow-md tracking-tight"
              >
                {s.name || "Unnamed Shop"}
              </motion.h3>

              <div className="mt-2 text-sm space-y-1">
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">👤</span>
                  {s.ownerName || s.owner || "Owner unknown"}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">📞</span>
                  {s.phone || "No contact info"}
                </p>
                {s.whatsapp || s.additionalPhone ? (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-yellow-500">🟢</span>
                    {s.whatsapp || s.additionalPhone}
                  </p>
                ) : null}
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">✉️</span>
                  {s.email || "No email"}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">📍</span>
                  {s.address || "No address"}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  to={`/admin/shops/${s._id}`}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                >
                  Open
                </Link>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
