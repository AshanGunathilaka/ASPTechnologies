import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchInvoice,
  updateInvoice,
  createInvoice,
} from "../../../api/suppliers";
import InvoiceForm from "../../../components/Admin/supplier/InvoiceForm";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { toast, Toaster } from "react-hot-toast";

export default function InvoicePage() {
  const { supplierId, invoiceId } = useParams(); // invoiceId optional for new invoice
  const { auth } = useAuth();
  const token = auth?.token;
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [mode, setMode] = useState(invoiceId ? "view" : "create"); // view, edit, create
  // const [loading, setLoading] = useState(false);

  // Load invoice if editing/viewing
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;
      try {
        const res = await fetchInvoice(token, supplierId, invoiceId);
        setInvoice(res.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load invoice");
      }
    };
    loadInvoice();
  }, [invoiceId, supplierId, token]);

  const handleSave = async (data) => {
    try {
      if (mode === "create") {
        await createInvoice(token, supplierId, data);
        Swal.fire({
          icon: "success",
          title: "Invoice Created!",
          text: "New invoice created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await updateInvoice(token, supplierId, invoiceId, data);
        Swal.fire({
          icon: "success",
          title: "Invoice Updated!",
          text: "Invoice updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      navigate(`/admin/suppliers/${supplierId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save invoice");
    }
  };

  if (invoiceId && !invoice)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 animate-pulse">
        Loading invoice...
      </div>
    );

  // Compute the original grand total from items and discount to ensure payments don't affect it
  const computedSubtotal = (invoice?.items || []).reduce(
    (s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0),
    0
  );
  const computedGrand = computedSubtotal - Number(invoice?.discount || 0);

  // Compute remaining credit days: creditDays - days since invoice date
  const creditDays = Number(invoice?.creditDays || 0);
  const invDate = invoice ? new Date(invoice.date) : new Date();
  const daysSince = Math.floor(
    (new Date().setHours(0, 0, 0, 0) - invDate.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  const remainingDays = creditDays - (isNaN(daysSince) ? 0 : daysSince);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
    >
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg"
      >
        {/* Back Button */}
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/admin/suppliers/${supplierId}`)}
          className="mb-4 px-4 py-2 font-semibold rounded-xl shadow text-white bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 transition-all"
        >
          ← Back to Supplier
        </motion.button>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-700 mb-4"
        >
          {mode === "create"
            ? "New Invoice"
            : `Invoice #${invoice.number} — ${new Date(
                invoice.date
              ).toLocaleDateString()}`}
        </motion.h1>

        {/* Invoice Details or Form */}
        {mode === "view" && invoice ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="p-4 bg-yellow-50 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Invoice #:</span>
                <span>{invoice.number}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Date:</span>
                <span>{new Date(invoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Sales Rep:</span>
                <span>{invoice.salesRep}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Credit Days:</span>
                <span>{creditDays}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Remaining Days:</span>
                <span
                  className={
                    remainingDays < 0 ? "text-red-600 font-semibold" : ""
                  }
                >
                  {remainingDays}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Discount:</span>
                <span>{invoice.discount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Grand Total:</span>
                <span className="font-semibold text-amber-600">
                  {computedGrand.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border border-yellow-200">
              <h3 className="font-semibold mb-2">Items</h3>
              <ul className="list-disc ml-6 space-y-1">
                {invoice.items.map((item, idx) => (
                  <li key={idx}>
                    {item.description} — Qty: {item.quantity}, Unit Price:{" "}
                    {item.unitPrice}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode("edit")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition-all"
              >
                Edit Invoice
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(
                    `/admin/suppliers/${supplierId}/invoices/${invoiceId}/payments`
                  )
                }
                className="px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition-all"
              >
                View Payments
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <InvoiceForm initial={invoice || {}} onSubmit={handleSave} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
