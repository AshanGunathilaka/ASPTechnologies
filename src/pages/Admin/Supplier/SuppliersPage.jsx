import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchSuppliers,
  createSupplier,
  deleteSupplier,
  fetchInvoices,
} from "../../../api/suppliers";
import SupplierForm from "../../../components/Admin/supplier/SupplierForm";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;

export default function SuppliersPage() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSuppliers(token);
      const supplierList = Array.isArray(res.data) ? res.data : [];
      setSuppliers(supplierList);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadSuppliers();
  }, [token, loadSuppliers]);

  const handleCreate = async (data) => {
    try {
      await createSupplier(token, data);
      toast.success("Supplier created successfully!");
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleDelete = async (id) => {
    // 1) Check for related invoices first
    try {
      const invRes = await fetchInvoices(token, id);
      const invoiceCount = Array.isArray(invRes?.data) ? invRes.data.length : 0;
      if (invoiceCount > 0) {
        await Swal.fire({
          title: "Cannot delete supplier",
          html: `This supplier has <b>${invoiceCount}</b> linked invoice${
            invoiceCount > 1 ? "s" : ""
          }.<br/>Delete is blocked to preserve data integrity.`,
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          confirmButtonText: "OK",
          background: "#fff7ed",
          backdrop: `rgba(0,0,0,0.4)`,
        });
        return;
      }
    } catch (err) {
      console.error(err);
      // If invoice check fails unexpectedly, show a friendly error and stop
      toast.error(err.response?.data?.message || "Could not verify invoices");
      return;
    }

    // 2) No invoices -> ask for delete confirmation
    const result = await Swal.fire({
      title: "Delete this supplier?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
      backdrop: `
        rgba(0,0,0,0.4)
        left top
        no-repeat
      `,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSupplier(token, id);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Supplier deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      loadSuppliers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
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
                d="M3 7.5h18M3 12h18M3 16.5h18M5 3v18M19 3v18"
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
              Supplier Management
            </motion.h2>

            <p className="text-gray-500 text-sm mt-0">
              Manage your trusted partners efficiently ✨
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
          className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300
    ${
      showForm
        ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
        : "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-gray-900 hover:from-yellow-500 hover:to-amber-500"
    }
  `}
        >
          {/* Shimmer effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-60 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-[1.2s] rounded-xl"></span>

          {/* Button label */}
          <span className="relative flex items-center justify-center gap-2 z-10  text-white">
            {showForm ? (
              <>
                <span>✖</span> <span>Close Form</span>
              </>
            ) : (
              <>
                <span>➕</span> <span>Create Supplier</span>
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
        {showForm && <SupplierForm onSubmit={handleCreate} />}
      </motion.div>

      {loading ? (
        <p className="text-gray-600 text-center mt-10 animate-pulse">
          Loading suppliers...
        </p>
      ) : suppliers.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center mt-10"
        >
          No suppliers found 😔
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        >
          {suppliers.map((s, index) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-yellow-200"
            >
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 drop-shadow-md tracking-tight"
              >
                {s.name || "Unnamed Supplier"}
              </motion.h3>

              <div className="mt-2 text-sm space-y-1">
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">📞</span>
                  {s.mobile || "No contact info"}
                </p>
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
                  to={`/admin/suppliers/${s._id}`}
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
