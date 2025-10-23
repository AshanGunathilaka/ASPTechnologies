import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchSupplier,
  fetchInvoices,
  createInvoice,
  deleteInvoice,
  updateSupplier,
} from "../../../api/suppliers";
import { fetchPayments } from "../../../api/payments";
import SupplierForm from "../../../components/Admin/supplier/SupplierForm";
import InvoiceForm from "../../../components/Admin/supplier/InvoiceForm";
import { motion } from "framer-motion";
// Reference to satisfy certain ESLint configs that don't detect <motion.*> usage
const __MOTION_REF__ = motion;
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

export default function SupplierDetail() {
  const { supplierId } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paidTotals, setPaidTotals] = useState({}); // invoiceId -> sum(amount)
  const [editing, setEditing] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const s = await fetchSupplier(token, supplierId);
      setSupplier(s.data);
      const inv = await fetchInvoices(token, supplierId);
      setInvoices(inv.data);

      // fetch payments totals per invoice in parallel
      const totalsEntries = await Promise.all(
        (inv.data || []).map(async (invoice) => {
          try {
            const res = await fetchPayments(token, supplierId, invoice._id);
            const totalPaid = (res.data || []).reduce(
              (acc, p) => acc + Number(p.amount || 0),
              0
            );
            return [invoice._id, Number(totalPaid.toFixed(2))];
          } catch {
            return [invoice._id, 0];
          }
        })
      );
      setPaidTotals(Object.fromEntries(totalsEntries));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, supplierId]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleUpdate = async (data) => {
    try {
      await updateSupplier(token, supplierId, data);
      Swal.fire({
        icon: "success",
        title: "Supplier Updated!",
        text: "Supplier details updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      setEditing(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleCreateInvoice = async (data) => {
    try {
      await createInvoice(token, supplierId, data);
      toast.success("Invoice created successfully!");
      setShowInvoiceForm(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invoice create failed");
    }
  };

  const handleDeleteInvoice = async (invId) => {
    const result = await Swal.fire({
      title: "Delete this invoice?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#f9fafb",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteInvoice(token, supplierId, invId);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Invoice deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (!supplier)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 animate-pulse">
        Loading supplier details...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 drop-shadow-md tracking-tight mb-1 leading-[1.3] pb-1">
            {supplier.name || "Supplier Detail"}
          </h2>
          <p className="text-gray-500 text-sm mt-0">
            Manage invoices and update supplier information ✨
          </p>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 4px 15px rgba(250, 204, 21, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing((e) => !e)}
            className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
              ${
                editing
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-gray-900"
              }`}
          >
            {editing ? "✖ Close Edit" : "✏️ Edit Supplier"}
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 4px 15px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInvoiceForm((s) => !s)}
            className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
              ${
                showInvoiceForm
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white"
              }`}
          >
            {showInvoiceForm ? "✖ Close Invoice Form" : "➕ Create Invoice"}
          </motion.button>
        </div>
      </div>

      {/* Forms */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: editing ? 1 : 0, height: editing ? "auto" : 0 }}
        transition={{ duration: 0.4 }}
      >
        {editing && (
          <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
            <SupplierForm initial={supplier} onSubmit={handleUpdate} />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: showInvoiceForm ? 1 : 0,
          height: showInvoiceForm ? "auto" : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {showInvoiceForm && (
          <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
            <InvoiceForm onSubmit={handleCreateInvoice} />
          </div>
        )}
      </motion.div>

      {/* Invoice Section */}
      <motion.h3
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-yellow-700 mb-4"
      >
        Invoices
      </motion.h3>

      {loading ? (
        <p className="text-gray-600 text-center mt-10 animate-pulse">
          Loading invoices...
        </p>
      ) : invoices.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-center mt-10"
        >
          No invoices available for this supplier 😔
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        >
          {invoices.map((inv, index) => {
            const subtotal = (inv.items || []).reduce(
              (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
              0
            );
            const originalGrand = subtotal - Number(inv.discount || 0);
            const totalPaid = paidTotals[inv._id] || 0;
            const remaining = Number((originalGrand - totalPaid).toFixed(2));

            // credit days remaining
            const creditDays = Number(inv.creditDays || 0);
            const invDate = new Date(inv.date);
            const daysSince = Math.floor(
              (new Date().setHours(0, 0, 0, 0) - invDate.setHours(0, 0, 0, 0)) /
                (1000 * 60 * 60 * 24)
            );
            const remainingDays =
              creditDays - (isNaN(daysSince) ? 0 : daysSince);
            const isPaid = remaining <= 0;

            return (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-yellow-200"
              >
                <h4 className="text-lg font-semibold text-amber-700">
                  Invoice #{inv.number}
                </h4>
                <p className="text-gray-600 text-sm">
                  Date: {new Date(inv.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2">
                  💰 Grand Total:{" "}
                  <span className="font-semibold text-amber-600">
                    {originalGrand.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-700">
                  Paid: {totalPaid.toFixed(2)} | Remaining:{" "}
                  {remaining.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  Credit Days: {creditDays} | Remaining Days:{" "}
                  <span
                    className={
                      remainingDays < 0 ? "text-red-600 font-semibold" : ""
                    }
                  >
                    {remainingDays}
                  </span>
                </p>
                <p className="mt-1">
                  Status:{" "}
                  <span
                    className={
                      isPaid
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {isPaid ? "Payment Completed" : "Not Paid"}
                  </span>
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/suppliers/${supplierId}/invoices/${inv._id}`
                      )
                    }
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(inv._id)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
